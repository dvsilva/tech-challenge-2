const InvestmentRepository = require("../../infra/mongoose/repository/investmentRepository");

class DeleteInvestment {
  constructor() {
    this.investmentRepository = new InvestmentRepository();
  }

  async execute(investmentId, accountId) {
    try {
      // Verificar se o investimento existe e pertence ao usuário
      const existingInvestment = await this.investmentRepository.findById(
        investmentId
      );

      if (!existingInvestment) {
        return {
          success: false,
          message: "Investimento não encontrado",
        };
      }

      if (
        existingInvestment.accountId._id.toString() !== accountId.toString()
      ) {
        return {
          success: false,
          message: "Acesso negado ao investimento",
        };
      }

      // Verificar se o investimento pode ser deletado
      // (por exemplo, investimentos com vencimento futuro podem ter restrições)
      const canDelete = this.canDeleteInvestment(existingInvestment);
      if (!canDelete.allowed) {
        return {
          success: false,
          message: canDelete.reason,
        };
      }

      // Deletar o investimento
      await this.investmentRepository.delete(investmentId);

      return {
        success: true,
        deletedInvestment: {
          id: existingInvestment._id,
          name: existingInvestment.name,
          value: existingInvestment.value,
        },
        message: "Investimento removido com sucesso",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Erro ao remover investimento",
      };
    }
  }

  canDeleteInvestment(investment) {
    // Aqui você pode implementar regras de negócio específicas
    // Por exemplo, não permitir deletar investimentos de previdência privada
    // ou investimentos com vencimento muito próximo

    // Para este exemplo, vamos permitir a exclusão de todos os investimentos
    // mas com avisos especiais para alguns tipos

    if (investment.category === "previdencia_privada") {
      // Aviso especial mas permite exclusão
      return {
        allowed: true,
        reason: null,
        warning:
          "Atenção: Exclusão de previdência privada pode ter impactos tributários",
      };
    }

    if (investment.maturityDate) {
      const daysToMaturity = Math.ceil(
        (new Date(investment.maturityDate) - new Date()) / (1000 * 60 * 60 * 24)
      );
      if (daysToMaturity <= 30 && daysToMaturity > 0) {
        return {
          allowed: true,
          reason: null,
          warning: "Atenção: Investimento próximo ao vencimento",
        };
      }
    }

    return {
      allowed: true,
      reason: null,
    };
  }
}

module.exports = DeleteInvestment;
