const InvestmentRepository = require("../../infra/mongoose/repository/investmentRepository");
const { Investment } = require("../../infra/mongoose/modelos");

class SaveInvestment {
  constructor() {
    this.investmentRepository = new InvestmentRepository();
  }

  async execute(investmentData, accountId) {
    try {
      // Validações específicas
      this.validateInvestmentData(investmentData);

      // Criar o objeto de investimento
      const investment = {
        ...investmentData,
        accountId,
        value: investmentData.initialValue, // Valor inicial igual ao valor atual na criação
        purchaseDate: new Date(),
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
    const { type, category, subtype, initialValue, name } = data;

    if (!type || !["renda_fixa", "renda_variavel"].includes(type)) {
      throw new Error(
        "Tipo de investimento inválido. Use 'renda_fixa' ou 'renda_variavel'"
      );
    }

    if (
      !category ||
      !["fundos_investimento", "previdencia_privada", "bolsa_valores"].includes(
        category
      )
    ) {
      throw new Error(
        "Categoria de investimento inválida. Use 'fundos_investimento', 'previdencia_privada' ou 'bolsa_valores'"
      );
    }

    if (!subtype || subtype.trim() === "") {
      throw new Error("Subtipo do investimento é obrigatório");
    }

    if (!initialValue || initialValue <= 0) {
      throw new Error("Valor inicial deve ser maior que zero");
    }

    if (!name || name.trim() === "") {
      throw new Error("Nome do investimento é obrigatório");
    }

    // Validações específicas por categoria
    this.validateByCategory(type, category, data);
  }

  validateByCategory(type, category, data) {
    const validSubtypes = {
      renda_fixa: {
        fundos_investimento: [
          "CDB",
          "LCI",
          "LCA",
          "LC",
          "Tesouro Direto",
          "Debêntures",
        ],
        previdencia_privada: ["PGBL", "VGBL", "Previdência Corporativa"],
        bolsa_valores: ["Tesouro Direto"],
      },
      renda_variavel: {
        fundos_investimento: [
          "Fundos de Ações",
          "Fundos Multimercado",
          "Fundos Cambiais",
          "ETFs",
        ],
        previdencia_privada: ["VGBL Multimercado", "PGBL Multimercado"],
        bolsa_valores: ["Ações", "FIIs", "BDRs", "Options", "Futuros"],
      },
    };

    const allowedSubtypes = validSubtypes[type][category];
    if (!allowedSubtypes.includes(data.subtype)) {
      throw new Error(
        `Subtipo '${
          data.subtype
        }' não é válido para ${type} - ${category}. Tipos permitidos: ${allowedSubtypes.join(
          ", "
        )}`
      );
    }

    // Validação de vencimento para renda fixa
    if (type === "renda_fixa" && data.maturityDate) {
      const maturityDate = new Date(data.maturityDate);
      const today = new Date();
      if (maturityDate <= today) {
        throw new Error("Data de vencimento deve ser no futuro");
      }
    }
  }
}

module.exports = SaveInvestment;
