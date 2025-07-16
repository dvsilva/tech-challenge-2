const InvestmentRepository = require("../../infra/mongoose/repository/investmentRepository");

class SaveInvestment {
  constructor() {
    this.investmentRepository = new InvestmentRepository();
  }

  async execute(investmentData, accountId) {
    try {
      // Validações básicas
      this.validateInvestmentData(investmentData);

      // Criar o objeto de investimento
      const investment = {
        ...investmentData,
        accountId,
      };

      // Salvar o investimento
      const savedInvestment = await this.investmentRepository.save(investment);

      return {
        success: true,
        investment: savedInvestment,
        message: "Investimento criado com sucesso",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Erro ao criar investimento",
      };
    }
  }

  validateInvestmentData(data) {
    const { type, value, name } = data;

    if (!type || type.trim() === "") {
      throw new Error("Tipo do investimento é obrigatório");
    }

    if (!value || value <= 0) {
      throw new Error("Valor deve ser maior que zero");
    }

    if (!name || name.trim() === "") {
      throw new Error("Nome do investimento é obrigatório");
    }
  }
}

module.exports = SaveInvestment;
