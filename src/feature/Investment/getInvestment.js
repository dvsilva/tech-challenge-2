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
      const summary = await this.calculateSummary(accountId);

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

  async calculateSummary(accountId) {
    try {
      const [totalData, categoryData] = await Promise.all([
        this.investmentRepository.getTotalInvestmentsByAccount(accountId),
        this.investmentRepository.getInvestmentsByCategory(accountId),
      ]);

      const totalProfit = totalData.totalValue - totalData.totalInitialValue;
      const totalProfitPercentage =
        totalData.totalInitialValue > 0
          ? (totalProfit / totalData.totalInitialValue) * 100
          : 0;

      return {
        totalValue: totalData.totalValue,
        totalInitialValue: totalData.totalInitialValue,
        totalProfit,
        totalProfitPercentage: parseFloat(totalProfitPercentage.toFixed(2)),
        totalInvestments: totalData.count,
        byCategory: categoryData.map((cat) => ({
          category: cat._id,
          totalValue: cat.totalValue,
          totalInitialValue: cat.totalInitialValue,
          count: cat.count,
          averageYield: parseFloat((cat.averageYield || 0).toFixed(2)),
          profit: cat.totalValue - cat.totalInitialValue,
          profitPercentage:
            cat.totalInitialValue > 0
              ? parseFloat(
                  (
                    ((cat.totalValue - cat.totalInitialValue) /
                      cat.totalInitialValue) *
                    100
                  ).toFixed(2)
                )
              : 0,
        })),
      };
    } catch (error) {
      throw new Error(`Erro ao calcular resumo: ${error.message}`);
    }
  }
}

module.exports = GetInvestment;
