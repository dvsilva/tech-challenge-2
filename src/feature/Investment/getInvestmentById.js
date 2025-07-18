const InvestmentRepository = require("../../infra/mongoose/repository/investmentRepository");

class GetInvestmentById {
  constructor() {
    this.investmentRepository = new InvestmentRepository();
  }

  async execute(investmentId, accountId) {
    try {
      const investment = await this.investmentRepository.findById(investmentId);

      if (!investment) {
        return {
          success: false,
          message: "Investimento não encontrado",
        };
      }

      // Verificar se o investimento pertence à conta do usuário
      if (investment.accountId._id.toString() !== accountId.toString()) {
        return {
          success: false,
          message: "Acesso negado ao investimento",
        };
      }

      // Calcular métricas adicionais
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

      const enrichedInvestment = {
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
        daysToMaturity: cleanInvestment.maturityDate
          ? Math.ceil(
              (new Date(cleanInvestment.maturityDate) - new Date()) /
                (1000 * 60 * 60 * 24)
            )
          : null,
        investmentDays: Math.ceil(
          (new Date() - new Date(cleanInvestment.purchaseDate)) /
            (1000 * 60 * 60 * 24)
        ),
      };

      return {
        success: true,
        investment: enrichedInvestment,
        message: "Investimento encontrado com sucesso",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Erro ao buscar investimento",
      };
    }
  }
}

module.exports = GetInvestmentById;
