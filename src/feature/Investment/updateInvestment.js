const InvestmentRepository = require("../../infra/mongoose/repository/investmentRepository");

class UpdateInvestment {
  constructor() {
    this.investmentRepository = new InvestmentRepository();
  }

  async execute(investmentId, updateData, accountId) {
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

      // Validar dados de atualização
      this.validateUpdateData(updateData, existingInvestment);

      // Atualizar o investimento
      const updatedInvestment = await this.investmentRepository.update(
        investmentId,
        updateData
      );

      // Calcular métricas atualizadas
      const profit = updatedInvestment.value - updatedInvestment.initialValue;
      const profitPercentage =
        updatedInvestment.initialValue > 0
          ? ((updatedInvestment.value - updatedInvestment.initialValue) /
              updatedInvestment.initialValue) *
            100
          : 0;

      const enrichedInvestment = {
        ...updatedInvestment.toObject(),
        profit,
        profitPercentage: parseFloat(profitPercentage.toFixed(2)),
        isMatured: updatedInvestment.maturityDate
          ? new Date() >= new Date(updatedInvestment.maturityDate)
          : false,
      };

      return {
        success: true,
        investment: enrichedInvestment,
        message: "Investimento atualizado com sucesso",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Erro ao atualizar investimento",
      };
    }
  }

  validateUpdateData(data, existingInvestment) {
    // Não permitir alteração do valor inicial após criação
    if (
      data.initialValue !== undefined &&
      data.initialValue !== existingInvestment.initialValue
    ) {
      throw new Error(
        "Valor inicial não pode ser alterado após a criação do investimento"
      );
    }

    // Não permitir alteração da data de compra
    if (data.purchaseDate !== undefined) {
      throw new Error("Data de compra não pode ser alterada");
    }

    // Não permitir alteração do accountId
    if (data.accountId !== undefined) {
      throw new Error("Conta do investimento não pode ser alterada");
    }

    // Validar novo valor se fornecido
    if (data.value !== undefined && data.value < 0) {
      throw new Error("Valor do investimento não pode ser negativo");
    }

    // Validar rendimento atual se fornecido
    if (data.currentYield !== undefined && data.currentYield < -100) {
      throw new Error("Rendimento não pode ser menor que -100%");
    }

    // Validar data de vencimento se fornecida
    if (data.maturityDate !== undefined) {
      const maturityDate = new Date(data.maturityDate);
      const purchaseDate = new Date(existingInvestment.purchaseDate);
      if (maturityDate <= purchaseDate) {
        throw new Error(
          "Data de vencimento deve ser posterior à data de compra"
        );
      }
    }

    // Validar nível de risco
    if (
      data.riskLevel !== undefined &&
      !["baixo", "medio", "alto"].includes(data.riskLevel)
    ) {
      throw new Error("Nível de risco deve ser 'baixo', 'medio' ou 'alto'");
    }
  }
}

module.exports = UpdateInvestment;
