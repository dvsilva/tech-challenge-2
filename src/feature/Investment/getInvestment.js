const InvestmentRepository = require("../../infra/mongoose/repository/investmentRepository");

class GetInvestment {
  constructor() {
    this.investmentRepository = new InvestmentRepository();
  }

  async execute(accountId, filters = {}) {
    try {
      let investments;

      if (filters.type) {
        investments = await this.investmentRepository.findByType(
          accountId,
          filters.type
        );
      } else if (filters.category) {
        investments = await this.investmentRepository.findByCategory(
          accountId,
          filters.category
        );
      } else {
        investments = await this.investmentRepository.findByAccountId(
          accountId
        );
      }

      // Calcular métricas adicionais
      const enrichedInvestments = investments.map((investment) => {
        const profit = investment.value - investment.initialValue;
        const profitPercentage =
          investment.initialValue > 0
            ? ((investment.value - investment.initialValue) /
                investment.initialValue) *
              100
            : 0;

        const investmentObj = investment.toObject();

        // Remover campos desnecessários
        const { __v, createdAt, updatedAt, accountId, ...cleanInvestment } =
          investmentObj;

        return {
          id: cleanInvestment._id,
          type: cleanInvestment.type,
          category: cleanInvestment.category,
          subtype: cleanInvestment.subtype,
          name: cleanInvestment.name,
          value: cleanInvestment.value,
          initialValue: cleanInvestment.initialValue,
          currentYield: cleanInvestment.currentYield,
          profit,
          profitPercentage: parseFloat(profitPercentage.toFixed(2)),
          riskLevel: cleanInvestment.riskLevel,
          purchaseDate: cleanInvestment.purchaseDate,
          maturityDate: cleanInvestment.maturityDate,
          isMatured: cleanInvestment.maturityDate
            ? new Date() >= new Date(cleanInvestment.maturityDate)
            : false,
        };
      });

      // Calcular resumo dos investimentos
      const summary = await this.calculateSummary(accountId, filters);

      return {
        success: true,
        investments: enrichedInvestments,
        summary,
        count: enrichedInvestments.length,
        message: "Investimentos encontrados com sucesso",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Erro ao buscar investimentos",
      };
    }
  }

  async calculateSummary(accountId, filters = {}) {
    try {
      const [totalData, categoryData] = await Promise.all([
        this.investmentRepository.getTotalInvestmentsByAccountWithFilters(
          accountId,
          filters
        ),
        this.investmentRepository.getInvestmentsByCategoryWithFilters(
          accountId,
          filters
        ),
      ]);

      // Verificar se os dados existem
      const safeTotalData = totalData || {
        totalValue: 0,
        totalInitialValue: 0,
        count: 0,
      };
      const safeCategoryData = categoryData || [];

      const totalProfit =
        (safeTotalData.totalValue || 0) -
        (safeTotalData.totalInitialValue || 0);
      const totalProfitPercentage =
        (safeTotalData.totalInitialValue || 0) > 0
          ? (totalProfit / safeTotalData.totalInitialValue) * 100
          : 0;

      return {
        totalValue: safeTotalData.totalValue || 0,
        totalInitialValue: safeTotalData.totalInitialValue || 0,
        totalProfit,
        totalProfitPercentage: parseFloat(totalProfitPercentage.toFixed(2)),
        totalInvestments: safeTotalData.count || 0,
        byCategory: safeCategoryData.map((cat) => {
          const categoryProfit =
            (cat.totalValue || 0) - (cat.totalInitialValue || 0);
          const categoryProfitPercentage =
            (cat.totalInitialValue || 0) > 0
              ? (categoryProfit / cat.totalInitialValue) * 100
              : 0;

          return {
            category: cat._id || "unknown",
            totalValue: cat.totalValue || 0,
            totalInitialValue: cat.totalInitialValue || 0,
            count: cat.count || 0,
            averageYield: parseFloat((cat.averageYield || 0).toFixed(2)),
            profit: categoryProfit,
            profitPercentage: parseFloat(categoryProfitPercentage.toFixed(2)),
          };
        }),
      };
    } catch (error) {
      console.error("Erro detalhado no calculateSummary:", error);
      // Return default summary structure instead of throwing error
      return {
        totalValue: 0,
        totalInitialValue: 0,
        totalProfit: 0,
        totalProfitPercentage: 0,
        totalInvestments: 0,
        byCategory: [],
      };
    }
  }
}

module.exports = GetInvestment;
