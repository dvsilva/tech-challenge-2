const fs = require("fs");
const path = require("path");
const { User, Account, DetailedAccount } = require("../infra/mongoose/modelos");

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
        `Carregados ${jsonData.users.length} usuários e ${jsonData.transactions.length} transações do JSON`
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

      console.log("Inicialização do banco de dados concluída com sucesso!");

      // Retorna estatísticas
      return {
        usersCreated: savedUsers.length,
        accountsCreated: savedAccounts.length,
        transactionsCreated: transactionsForMongo.length,
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

      console.log("\n=== Estatísticas do Banco de Dados ===");
      console.log(`Usuários: ${userCount}`);
      console.log(`Contas: ${accountCount}`);
      console.log(`Transações: ${transactionCount}`);
      console.log("=====================================\n");

      return {
        users: userCount,
        accounts: accountCount,
        transactions: transactionCount,
      };
    } catch (error) {
      console.error("Erro ao obter estatísticas:", error);
      throw error;
    }
  }
}

module.exports = DataInitializerService;
