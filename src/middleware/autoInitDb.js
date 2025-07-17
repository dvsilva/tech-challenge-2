const DataInitializerService = require("../service/dataInitializer");

/**
 * Middleware para auto-inicialização do banco de dados no startup
 * Inicializa apenas se não houver dados e se a variável AUTO_INIT_DB estiver definida
 */
async function autoInitializeDatabase() {
  // Verifica se a auto-inicialização está habilitada
  if (!process.env.AUTO_INIT_DB || process.env.AUTO_INIT_DB !== "true") {
    return;
  }

  try {
    console.log("🔄 Verificando necessidade de auto-inicialização do banco...");

    const initializer = new DataInitializerService();

    // Verifica se já existem dados
    const isInitialized = await initializer.isDataInitialized();

    if (isInitialized) {
      console.log("✅ Banco de dados já contém dados.");
      await initializer.showDatabaseStats();
      return;
    }

    console.log("📦 Iniciando auto-inicialização do banco de dados...");
    const result = await initializer.initializeDatabase(true);

    if (result) {
      console.log("✅ Auto-inicialização concluída com sucesso!");
      console.log(`   - Usuários: ${result.usersCreated}`);
      console.log(`   - Contas: ${result.accountsCreated}`);
      console.log(`   - Transações: ${result.transactionsCreated}`);
      console.log(`   - Investimentos: ${result.investmentsCreated}`);
      console.log(`   - Cartões: ${result.cardsCreated || 0}`);
    }
  } catch (error) {
    console.error("❌ Erro durante auto-inicialização:", error.message);
    console.log(
      "   A aplicação continuará rodando, mas o banco pode estar vazio."
    );
    console.log(
      "   Use o endpoint POST /database/initialize ou o script npm run init-db para inicializar manualmente."
    );
  }
}

module.exports = autoInitializeDatabase;
