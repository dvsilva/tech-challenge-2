#!/usr/bin/env node

/**
 * Script de teste rápido para inicialização de investimentos
 * Testa a funcionalidade sem afetar dados existentes
 */

require("dotenv").config();
const connectDB = require("../src/infra/mongoose/mongooseConect");
const DataInitializerService = require("../src/service/dataInitializer");

async function testInvestmentsInit() {
  try {
    console.log("🔍 Testando inicialização de investimentos...\n");

    // Conectar ao banco
    await connectDB();
    console.log("✅ Conexão com MongoDB estabelecida");

    const initializer = new DataInitializerService();

    // Verificar estatísticas atuais
    console.log("\n📊 Estatísticas antes da inicialização:");
    const statsBefore = await initializer.showDatabaseStats();

    // Verificar se temos usuários e contas
    if (statsBefore.users === 0 || statsBefore.accounts === 0) {
      console.log("\n⚠️  Não há usuários e contas suficientes no banco.");
      console.log("   Inicializando dados básicos primeiro...");

      await initializer.initializeDatabase(false);
      console.log("✅ Dados básicos inicializados");
    }

    // Testar carregamento do JSON
    console.log("\n📁 Testando carregamento do db.json...");
    const jsonData = initializer.loadJsonData();

    if (!jsonData.investments || jsonData.investments.length === 0) {
      throw new Error("Nenhum investimento encontrado no db.json");
    }

    console.log(
      `✅ ${jsonData.investments.length} investimentos encontrados no JSON`
    );

    // Listar tipos de investimentos
    const types = [...new Set(jsonData.investments.map((inv) => inv.type))];
    console.log(`📈 Tipos: ${types.join(", ")}`);

    // Verificar se já existem investimentos
    const existingInvestments = statsBefore.investments || 0;

    if (existingInvestments > 0) {
      console.log(
        `\n⚠️  Já existem ${existingInvestments} investimentos no banco`
      );
      console.log(
        "   Para testar a criação, use: npm run init-investments:force"
      );
    } else {
      console.log("\n🚀 Testando criação de investimentos...");
      const result = await initializer.initializeInvestmentsOnly(false);

      if (result && result.investmentsCreated > 0) {
        console.log(
          `✅ ${result.investmentsCreated} investimentos criados com sucesso!`
        );
      } else {
        console.log("⚠️  Nenhum investimento foi criado");
      }
    }

    // Estatísticas finais
    console.log("\n📊 Estatísticas finais:");
    await initializer.showDatabaseStats();

    console.log("\n🎉 Teste concluído com sucesso!");
  } catch (error) {
    console.error("\n❌ Erro durante o teste:", error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Fechar conexão
    const mongoose = require("mongoose");
    await mongoose.connection.close();
    console.log("\n🔌 Conexão com MongoDB fechada");
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  testInvestmentsInit();
}

module.exports = testInvestmentsInit;
