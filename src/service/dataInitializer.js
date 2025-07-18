const fs = require("fs");
const path = require("path");
const {
  User,
  Account,
  DetailedAccount,
  Investment,
  Card,
} = require("../infra/mongoose/modelos");

class DataInitializerService {
  constructor() {
    this.dbJsonPath = path.join(__dirname, "../../db.json");
  }

  /**
   * Carrega os dados do arquivo db.json
   * @returns {Object} Dados do arquivo JSON
   */
  loadJsonData() {
    try {
      const jsonData = fs.readFileSync(this.dbJsonPath, "utf8");
      return JSON.parse(jsonData);
    } catch (error) {
      console.error("Erro ao ler o arquivo db.json:", error);
      throw error;
    }
  }

  /**
   * Mapeia os usuários do JSON para o formato do MongoDB
   * @param {Array} users - Array de usuários do JSON
   * @returns {Array} Array de usuários formatados para MongoDB
   */
  mapUsersForMongo(users) {
    return users.map((user) => ({
      name: user.name,
      username: user.name,
      email: user.email,
      password: user.password,
      originalId: user.id, // Mantém o ID original para referência
    }));
  }

  /**
   * Mapeia as transações do JSON para o formato do MongoDB
   * @param {Array} transactions - Array de transações do JSON
   * @param {Object} userMapping - Mapeamento de IDs originais para ObjectIds do MongoDB
   * @returns {Array} Array de transações formatadas para MongoDB
   */
  mapTransactionsForMongo(transactions, userMapping, accountMapping) {
    return transactions
      .map((transaction) => ({
        type: transaction.type,
        amount: transaction.amount,
        date: new Date(transaction.date),
        from: transaction.description || "Sistema",
        to: transaction.description || "Sistema",
        description: transaction.description,
        accountId: accountMapping[transaction.id_user] || null,
        originalId: transaction.id, // Mantém o ID original para referência
      }))
      .filter((t) => t.accountId); // Remove transações sem conta válida
  }

  /**
   * Mapeia os investimentos do JSON para o formato do MongoDB
   * @param {Array} investments - Array de investimentos do JSON
   * @param {Object} accountMapping - Mapeamento de IDs de usuários para ObjectIds de contas
   * @returns {Array} Array de investimentos formatados para MongoDB
   */
  mapInvestmentsForMongo(investments, accountMapping) {
    return investments
      .map((investment) => ({
        type: investment.type,
        category: investment.category,
        subtype: investment.subtype,
        name: investment.name,
        value: investment.value,
        initialValue: investment.initialValue,
        currentYield: investment.currentYield || 0,
        riskLevel: investment.riskLevel || "medio",
        purchaseDate: investment.purchaseDate
          ? new Date(investment.purchaseDate)
          : new Date(),
        maturityDate: investment.maturityDate
          ? new Date(investment.maturityDate)
          : null,
        accountId: accountMapping[investment.id_user] || null,
        originalId: investment.id, // Mantém o ID original para referência
      }))
      .filter((inv) => inv.accountId); // Remove investimentos sem conta válida
  }

  /**
   * Mapeia os cartões do JSON para o formato do MongoDB
   * @param {Array} cards - Array de cartões do JSON
   * @param {Object} accountMapping - Mapeamento de IDs de usuários para ObjectIds de contas
   * @returns {Array} Array de cartões formatados para MongoDB
   */
  mapCardsForMongo(cards, accountMapping) {
    return cards
      .map((card) => ({
        type: card.type,
        is_blocked: card.is_blocked || false,
        number: card.number,
        dueDate: new Date(card.dueDate),
        functions: card.functions,
        cvc: card.cvc,
        paymentDate: card.paymentDate ? new Date(card.paymentDate) : null,
        name: card.name,
        accountId: accountMapping[card.id_user] || null,
        originalId: card.id, // Mantém o ID original para referência
      }))
      .filter((card) => card.accountId); // Remove cartões sem conta válida
  }

  /**
   * Cria contas padrão para cada usuário
   * @param {Array} mongoUsers - Usuários já salvos no MongoDB
   * @returns {Array} Array de contas criadas
   */
  async createDefaultAccounts(mongoUsers) {
    const accounts = [];

    for (let i = 0; i < mongoUsers.length; i++) {
      const user = mongoUsers[i];
      // Gera um número de conta único baseado no timestamp e index
      const accountNumber = `${Date.now().toString().slice(-6)}-${(i + 1)
        .toString()
        .padStart(2, "0")}`;

      const account = new Account({
        type: "corrente",
        userId: user._id,
        accountNumber: accountNumber,
      });

      const savedAccount = await account.save();
      accounts.push(savedAccount);
    }

    return accounts;
  }

  /**
   * Verifica se os dados já foram inicializados
   * @returns {Boolean} True se já existem dados no banco
   */
  async isDataInitialized() {
    const userCount = await User.countDocuments();
    return userCount > 0;
  }

  /**
   * Limpa todos os dados das coleções
   */
  async clearAllData() {
    try {
      await Promise.all([
        User.deleteMany({}),
        Account.deleteMany({}),
        DetailedAccount.deleteMany({}),
        Investment.deleteMany({}),
        Card.deleteMany({}),
      ]);
      console.log("Dados limpos com sucesso");
    } catch (error) {
      console.error("Erro ao limpar dados:", error);
      throw error;
    }
  }

  /**
   * Inicializa o banco de dados com os dados do db.json
   * @param {Boolean} forceReset - Se true, limpa os dados existentes antes de inicializar
   */
  async initializeDatabase(forceReset = false) {
    try {
      console.log("Iniciando inicialização do banco de dados...");

      // Verifica se já existem dados
      if (!forceReset && (await this.isDataInitialized())) {
        console.log(
          "Banco de dados já foi inicializado. Use forceReset=true para reinicializar."
        );
        return;
      }

      // Limpa dados existentes se forceReset=true
      if (forceReset) {
        await this.clearAllData();
      }

      // Carrega dados do JSON
      const jsonData = this.loadJsonData();
      console.log(
        `Carregados ${jsonData.users.length} usuários, ${
          jsonData.transactions.length
        } transações, ${jsonData.investments?.length || 0} investimentos e ${
          jsonData.cards?.length || 0
        } cartões do JSON`
      );

      // 1. Criar usuários
      const usersForMongo = this.mapUsersForMongo(jsonData.users);
      const savedUsers = await User.insertMany(usersForMongo);
      console.log(`${savedUsers.length} usuários salvos no MongoDB`);

      // 2. Criar mapeamento de IDs originais para ObjectIds
      const userMapping = {};
      savedUsers.forEach((user, index) => {
        userMapping[jsonData.users[index].id] = user._id;
      });

      // 3. Criar contas padrão para cada usuário
      const savedAccounts = await this.createDefaultAccounts(savedUsers);
      console.log(`${savedAccounts.length} contas criadas`);

      // 4. Criar mapeamento de usuários para contas
      const accountMapping = {};
      savedAccounts.forEach((account) => {
        // Encontra o usuário original correspondente
        const originalUser = jsonData.users.find(
          (u) => userMapping[u.id].toString() === account.userId.toString()
        );
        if (originalUser) {
          accountMapping[originalUser.id] = account._id;
        }
      });

      // 5. Criar transações
      const transactionsForMongo = this.mapTransactionsForMongo(
        jsonData.transactions,
        userMapping,
        accountMapping
      );

      if (transactionsForMongo.length > 0) {
        const savedTransactions = await DetailedAccount.insertMany(
          transactionsForMongo
        );
        console.log(`${savedTransactions.length} transações salvas no MongoDB`);
      }

      // 6. Criar investimentos
      let savedInvestments = [];
      if (jsonData.investments && jsonData.investments.length > 0) {
        const investmentsForMongo = this.mapInvestmentsForMongo(
          jsonData.investments,
          accountMapping
        );

        if (investmentsForMongo.length > 0) {
          savedInvestments = await Investment.insertMany(investmentsForMongo);
          console.log(
            `${savedInvestments.length} investimentos salvos no MongoDB`
          );
        }
      }

      // 7. Criar cartões
      let savedCards = [];
      if (jsonData.cards && jsonData.cards.length > 0) {
        const cardsForMongo = this.mapCardsForMongo(
          jsonData.cards,
          accountMapping
        );

        if (cardsForMongo.length > 0) {
          savedCards = await Card.insertMany(cardsForMongo);
          console.log(`${savedCards.length} cartões salvos no MongoDB`);
        }
      }

      console.log("Inicialização do banco de dados concluída com sucesso!");

      // Retorna estatísticas
      return {
        usersCreated: savedUsers.length,
        accountsCreated: savedAccounts.length,
        transactionsCreated: transactionsForMongo.length,
        investmentsCreated: savedInvestments.length,
        cardsCreated: savedCards.length,
      };
    } catch (error) {
      console.error("Erro durante a inicialização do banco de dados:", error);
      throw error;
    }
  }

  /**
   * Exibe estatísticas do banco de dados
   */
  async showDatabaseStats() {
    try {
      const userCount = await User.countDocuments();
      const accountCount = await Account.countDocuments();
      const transactionCount = await DetailedAccount.countDocuments();
      const investmentCount = await Investment.countDocuments();
      const cardCount = await Card.countDocuments();

      console.log("\n=== Estatísticas do Banco de Dados ===");
      console.log(`Usuários: ${userCount}`);
      console.log(`Contas: ${accountCount}`);
      console.log(`Transações: ${transactionCount}`);
      console.log(`Investimentos: ${investmentCount}`);
      console.log(`Cartões: ${cardCount}`);
      console.log("=====================================\n");

      return {
        users: userCount,
        accounts: accountCount,
        transactions: transactionCount,
        investments: investmentCount,
        cards: cardCount,
      };
    } catch (error) {
      console.error("Erro ao obter estatísticas:", error);
      throw error;
    }
  }

  /**
   * Inicializa apenas os investimentos no banco de dados
   * @param {Boolean} forceReset - Se true, limpa os investimentos existentes antes de inicializar
   */
  async initializeInvestmentsOnly(forceReset = false) {
    try {
      console.log("Iniciando inicialização apenas dos investimentos...");

      // Verifica se existem usuários e contas no banco
      const userCount = await User.countDocuments();
      const accountCount = await Account.countDocuments();

      if (userCount === 0 || accountCount === 0) {
        throw new Error(
          "É necessário ter usuários e contas cadastrados antes de criar investimentos. Execute a inicialização completa primeiro."
        );
      }

      // Limpa investimentos existentes se forceReset=true
      if (forceReset) {
        await Investment.deleteMany({});
        console.log("Investimentos existentes removidos.");
      }

      // Verifica se já existem investimentos
      const existingInvestments = await Investment.countDocuments();
      if (existingInvestments > 0 && !forceReset) {
        console.log(
          `Já existem ${existingInvestments} investimentos no banco. Use forceReset=true para reinicializar.`
        );
        return { investmentsCreated: existingInvestments };
      }

      // Carrega dados do JSON
      const jsonData = this.loadJsonData();

      if (!jsonData.investments || jsonData.investments.length === 0) {
        console.log("Nenhum investimento encontrado no db.json");
        return { investmentsCreated: 0 };
      }

      // Busca todas as contas existentes
      const accounts = await Account.find({});
      console.log(`Encontradas ${accounts.length} contas no banco`);

      // Busca todos os usuários para criar mapeamento
      const users = await User.find({});

      // Cria mapeamento de usuários originais para contas
      const accountMapping = {};
      accounts.forEach((account) => {
        // Encontra o usuário correspondente pelo userId da conta
        const user = users.find(
          (u) => u._id.toString() === account.userId.toString()
        );
        if (user && user.originalId) {
          accountMapping[user.originalId] = account._id;
        }
      });

      // Mapeia investimentos
      const investmentsForMongo = this.mapInvestmentsForMongo(
        jsonData.investments,
        accountMapping
      );

      if (investmentsForMongo.length === 0) {
        console.log("Nenhum investimento válido encontrado após mapeamento");
        return { investmentsCreated: 0 };
      }

      // Salva investimentos
      const savedInvestments = await Investment.insertMany(investmentsForMongo);
      console.log(`${savedInvestments.length} investimentos salvos no MongoDB`);

      console.log("Inicialização de investimentos concluída com sucesso!");

      return {
        investmentsCreated: savedInvestments.length,
      };
    } catch (error) {
      console.error("Erro durante a inicialização de investimentos:", error);
      throw error;
    }
  }
}

module.exports = DataInitializerService;
