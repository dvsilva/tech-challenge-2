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
        type: investmentData.type,
        category: investmentData.category,
        subtype: investmentData.subtype,
        name: investmentData.name,
        value: investmentData.initialValue, // Valor inicial igual ao valor atual na criação
        initialValue: investmentData.initialValue,
        currentYield: investmentData.currentYield || 0,
        riskLevel: investmentData.riskLevel,
        purchaseDate: investmentData.purchaseDate || new Date(),
        maturityDate: investmentData.maturityDate || null,
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
    const { type, category, subtype, initialValue, name, riskLevel } = data;

    if (!type || !["renda_fixa", "renda_variavel"].includes(type)) {
      throw new Error(
        "Tipo de investimento inválido. Use 'renda_fixa' ou 'renda_variavel'"
      );
    }

    const validCategories = [
      "cdb",
      "lci",
      "lca",
      "tesouro_direto",
      "debentures",
      "fundos_investimento",
      "fundos_imobiliarios",
      "acoes",
      "criptomoedas",
    ];

    if (!category || !validCategories.includes(category)) {
      throw new Error(
        `Categoria de investimento inválida. Use uma das seguintes: ${validCategories.join(
          ", "
        )}`
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

    if (!riskLevel || !["baixo", "medio", "alto"].includes(riskLevel)) {
      throw new Error("Nível de risco deve ser 'baixo', 'medio' ou 'alto'");
    }

    // Validações específicas por categoria
    this.validateByCategory(type, category, data);
  }

  validateByCategory(type, category, data) {
    const validSubtypes = {
      renda_fixa: {
        cdb: ["CDB", "CDB Verde"],
        lci: ["LCI"],
        lca: ["LCA"],
        tesouro_direto: ["Tesouro Selic", "Tesouro IPCA+", "Tesouro Prefixado"],
        debentures: ["Debênture"],
      },
      renda_variavel: {
        fundos_investimento: [
          "Fundo Multimercado",
          "Fundo de Ações",
          "Fundo Cambial",
        ],
        fundos_imobiliarios: ["FII"],
        acoes: ["Carteira Diversificada", "Ações Individuais"],
        criptomoedas: ["Portfolio Crypto", "Bitcoin", "Ethereum"],
      },
    };

    const allowedSubtypes = validSubtypes[type][category];
    if (!allowedSubtypes || !allowedSubtypes.includes(data.subtype)) {
      throw new Error(
        `Subtipo '${
          data.subtype
        }' não é válido para ${type} - ${category}. Tipos permitidos: ${
          allowedSubtypes ? allowedSubtypes.join(", ") : "Nenhum"
        }`
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
