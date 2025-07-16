const InvestmentRepository = require("../../infra/mongoose/repository/investmentRepository");
const { Account, DetailedAccount } = require("../../infra/mongoose/modelos");

class RedeemInvestment {
  constructor() {
    this.investmentRepository = new InvestmentRepository();
  }

  async execute(redeemData, accountId) {
    try {
      const {
        investmentId,
        amount,
        description,
        redeemType = "partial",
      } = redeemData;

      // Validações
      this.validateRedeemData(redeemData);

      // Verificar se a conta existe
      const account = await Account.findById(accountId);
      if (!account) {
        return {
          success: false,
          message: "Conta não encontrada",
        };
      }

      // Verificar se o investimento existe e pertence ao usuário
      const investment = await this.investmentRepository.findById(investmentId);
      if (!investment) {
        return {
          success: false,
          message: "Investimento não encontrado",
        };
      }

      if (investment.accountId._id.toString() !== accountId.toString()) {
        return {
          success: false,
          message: "Acesso negado ao investimento",
        };
      }

      // Verificar se o valor do resgate é válido
      if (amount > investment.value) {
        return {
          success: false,
          message: "Valor do resgate excede o valor disponível no investimento",
        };
      }

      let updatedInvestment;
      let isCompleteRedemption = false;

      if (redeemType === "total" || amount === investment.value) {
        // Resgate total - deletar o investimento
        await this.investmentRepository.delete(investmentId);
        isCompleteRedemption = true;
        updatedInvestment = null;
      } else {
        // Resgate parcial - atualizar o valor do investimento
        const newInvestmentValue = investment.value - amount;
        updatedInvestment = await this.investmentRepository.update(
          investmentId,
          {
            value: newInvestmentValue,
          }
        );
      }

      // Registrar a transação na conta (valor positivo pois está entrando na conta)
      const transaction = {
        type: "resgate_investimento",
        amount: amount,
        from: `Investimento: ${investment.name}`,
        to: account.accountNumber,
        description:
          description ||
          `Resgate ${redeemType} do investimento: ${investment.name}`,
        date: new Date(),
        accountId: accountId,
      };

      await DetailedAccount.create(transaction);

      // Calcular métricas se não foi resgate total
      let result = {
        success: true,
        transaction,
        redeemedAmount: amount,
        redeemType: isCompleteRedemption ? "total" : "partial",
        message: `Resgate ${
          isCompleteRedemption ? "total" : "parcial"
        } realizado com sucesso`,
      };

      if (!isCompleteRedemption && updatedInvestment) {
        const profit = updatedInvestment.value - updatedInvestment.initialValue;
        const profitPercentage =
          updatedInvestment.initialValue > 0
            ? ((updatedInvestment.value - updatedInvestment.initialValue) /
                updatedInvestment.initialValue) *
              100
            : 0;

        result.investment = {
          ...updatedInvestment.toObject(),
          profit,
          profitPercentage: parseFloat(profitPercentage.toFixed(2)),
        };
        result.newInvestmentValue = updatedInvestment.value;
      } else {
        result.investmentCompletelyRedeemed = true;
        result.originalInvestmentValue = investment.value;
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Erro ao realizar resgate do investimento",
      };
    }
  }

  validateRedeemData(data) {
    const { investmentId, amount, redeemType } = data;

    if (!investmentId) {
      throw new Error("ID do investimento é obrigatório");
    }

    if (!amount || amount <= 0) {
      throw new Error("Valor do resgate deve ser maior que zero");
    }

    if (redeemType && !["partial", "total"].includes(redeemType)) {
      throw new Error("Tipo de resgate deve ser 'partial' ou 'total'");
    }

    if (data.description && data.description.length > 255) {
      throw new Error("Descrição deve ter no máximo 255 caracteres");
    }
  }
}

module.exports = RedeemInvestment;
