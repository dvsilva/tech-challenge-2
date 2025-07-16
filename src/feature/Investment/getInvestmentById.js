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

      const enrichedInvestment = {
        ...investment.toObject(),
        profit,
        profitPercentage: parseFloat(profitPercentage.toFixed(2)),
        isMatured: investment.maturityDate
          ? new Date() >= new Date(investment.maturityDate)
          : false,
        daysToMaturity: investment.maturityDate
          ? Math.ceil(
              (new Date(investment.maturityDate) - new Date()) /
                (1000 * 60 * 60 * 24)
            )
          : null,
        investmentDays: Math.ceil(
          (new Date() - new Date(investment.purchaseDate)) /
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
