#!/usr/bin/env node

/**
 * Script para inicializar o banco de dados com dados do db.json
 *
 * Uso:
 * node scripts/initDb.js [--force] [--stats] [--investments-only]
 *
 * Opções:
 * --force: Força a reinicialização, removendo dados existentes
 * --stats: Exibe apenas as estatísticas do banco sem inicializar
 * --investments-only: Inicializa apenas os investimentos
 */

require("dotenv").config();
const connectDB = require("../src/infra/mongoose/mongooseConect");
const DataInitializerService = require("../src/service/dataInitializer");

async function main() {
  const args = process.argv.slice(2);
  const forceReset = args.includes("--force");
  const showStatsOnly = args.includes("--stats");
  const investmentsOnly = args.includes("--investments-only");

  try {
    console.log("Conectando ao banco de dados...");
    await connectDB();
    console.log("Conexão estabelecida com sucesso!");

    const initializer = new DataInitializerService();

    if (showStatsOnly) {
      await initializer.showDatabaseStats();
      process.exit(0);
    }

    if (investmentsOnly) {
      console.log("\n=== Inicializador de Investimentos ===");
      console.log(
        `Modo: ${forceReset ? "RESET FORÇADO" : "INICIALIZAÇÃO NORMAL"}`
      );
      console.log("====================================\n");

      const result = await initializer.initializeInvestmentsOnly(forceReset);

      if (result) {
        console.log("\n=== Resultado da Inicialização ===");
        console.log(`✅ Investimentos criados: ${result.investmentsCreated}`);
        console.log("=================================\n");
      }

      await initializer.showDatabaseStats();
      process.exit(0);
    }

    console.log("\n=== Inicializador do Banco de Dados ===");
    console.log(
      `Modo: ${forceReset ? "RESET FORÇADO" : "INICIALIZAÇÃO NORMAL"}`
    );
    console.log("======================================\n");

    const result = await initializer.initializeDatabase(forceReset);

    if (result) {
      console.log("\n=== Resultado da Inicialização ===");
      console.log(`✅ Usuários criados: ${result.usersCreated}`);
      console.log(`✅ Contas criadas: ${result.accountsCreated}`);
      console.log(`✅ Transações criadas: ${result.transactionsCreated}`);
      console.log(`✅ Investimentos criados: ${result.investmentsCreated}`);
      console.log("=================================\n");
    }

    await initializer.showDatabaseStats();
  } catch (error) {
    console.error("❌ Erro durante a execução:", error.message);
    process.exit(1);
  } finally {
    // Fechar conexão do mongoose
    const mongoose = require("mongoose");
    await mongoose.connection.close();
    console.log("Conexão com o banco de dados fechada.");
  }
}

// Executa apenas se este arquivo for chamado diretamente
if (require.main === module) {
  main();
}

module.exports = main;
