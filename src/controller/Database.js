const DataInitializerService = require("../service/dataInitializer");

class DatabaseController {
  /**
   * Inicializa o banco de dados com dados do db.json
   * POST /api/database/initialize
   */
  static async initializeDatabase(req, res) {
    try {
      const { forceReset = false } = req.body;

      const initializer = new DataInitializerService();
      const result = await initializer.initializeDatabase(forceReset);

      if (!result) {
        return res.status(200).json({
          success: true,
          message: "Banco de dados já foi inicializado",
          data: null,
        });
      }

      const stats = await initializer.showDatabaseStats();

      res.status(200).json({
        success: true,
        message: "Banco de dados inicializado com sucesso",
        data: {
          created: result,
          currentStats: stats,
        },
      });
    } catch (error) {
      console.error("Erro ao inicializar banco de dados:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor ao inicializar banco de dados",
        error: error.message,
      });
    }
  }

  /**
   * Obtém estatísticas do banco de dados
   * GET /api/database/stats
   */
  static async getDatabaseStats(req, res) {
    try {
      const initializer = new DataInitializerService();
      const stats = await initializer.showDatabaseStats();

      res.status(200).json({
        success: true,
        message: "Estatísticas obtidas com sucesso",
        data: stats,
      });
    } catch (error) {
      console.error("Erro ao obter estatísticas:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor ao obter estatísticas",
        error: error.message,
      });
    }
  }

  /**
   * Limpa todos os dados do banco
   * DELETE /api/database/clear
   */
  static async clearDatabase(req, res) {
    try {
      const initializer = new DataInitializerService();
      await initializer.clearAllData();

      const stats = await initializer.showDatabaseStats();

      res.status(200).json({
        success: true,
        message: "Banco de dados limpo com sucesso",
        data: stats,
      });
    } catch (error) {
      console.error("Erro ao limpar banco de dados:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor ao limpar banco de dados",
        error: error.message,
      });
    }
  }

  /**
   * Inicializa apenas os investimentos no banco de dados
   * POST /api/database/initialize-investments
   */
  static async initializeInvestments(req, res) {
    try {
      const { forceReset = false } = req.body;

      const initializer = new DataInitializerService();
      const result = await initializer.initializeInvestmentsOnly(forceReset);

      const stats = await initializer.showDatabaseStats();

      res.status(200).json({
        success: true,
        message: "Investimentos inicializados com sucesso",
        data: {
          created: result,
          currentStats: stats,
        },
      });
    } catch (error) {
      console.error("Erro ao inicializar investimentos:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor ao inicializar investimentos",
        error: error.message,
      });
    }
  }

  /**
   * Verifica se o banco foi inicializado
   * GET /api/database/status
   */
  static async getDatabaseStatus(req, res) {
    try {
      const initializer = new DataInitializerService();
      const isInitialized = await initializer.isDataInitialized();
      const stats = await initializer.showDatabaseStats();

      res.status(200).json({
        success: true,
        message: "Status obtido com sucesso",
        data: {
          isInitialized,
          stats,
        },
      });
    } catch (error) {
      console.error("Erro ao verificar status:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor ao verificar status",
        error: error.message,
      });
    }
  }
}

module.exports = DatabaseController;
