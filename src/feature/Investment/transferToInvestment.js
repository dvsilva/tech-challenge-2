const InvestmentRepository = require("../../infra/mongoose/repository/investmentRepository");
const { Account, DetailedAccount } = require("../../infra/mongoose/modelos");

class TransferToInvestment {
  constructor() {
    this.investmentRepository = new InvestmentRepository();
  }

  async execute(transferData, accountId) {
    try {
      const { investmentId, amount, description } = transferData;

      // Validações
      this.validateTransferData(transferData);

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

      // Verificar saldo disponível na conta (isso seria implementado na lógica de conta)
      // Por agora, vamos assumir que a verificação de saldo é feita em outro lugar

      // Atualizar o valor do investimento
      const newInvestmentValue = investment.value + amount;
      const updatedInvestment = await this.investmentRepository.update(
        investmentId,
        {
          value: newInvestmentValue,
        }
      );

      // Registrar a transação na conta
      const transaction = {
        type: "investimento",
        amount: -amount, // Valor negativo pois está saindo da conta
        from: account.accountNumber,
        to: `Investimento: ${investment.name}`,
        description:
          description || `Transferência para investimento: ${investment.name}`,
        date: new Date(),
        accountId: accountId,
      };

      await DetailedAccount.create(transaction);

      // Calcular métricas atualizadas
      const profit = updatedInvestment.value - updatedInvestment.initialValue;
      const profitPercentage =
        updatedInvestment.initialValue > 0
          ? ((updatedInvestment.value - updatedInvestment.initialValue) /
              updatedInvestment.initialValue) *
            100
          : 0;

      return {
        success: true,
        investment: {
          ...updatedInvestment.toObject(),
          profit,
          profitPercentage: parseFloat(profitPercentage.toFixed(2)),
        },
        transaction,
        transferAmount: amount,
        newInvestmentValue,
        message: "Transferência para investimento realizada com sucesso",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Erro ao transferir para investimento",
      };
    }
  }

  validateTransferData(data) {
    const { investmentId, amount, description } = data;

    if (!investmentId) {
      throw new Error("ID do investimento é obrigatório");
    }

    if (!amount || amount <= 0) {
      throw new Error("Valor da transferência deve ser maior que zero");
    }

    if (amount > 1000000) {
      throw new Error("Valor da transferência excede o limite máximo");
    }

    if (description && description.length > 255) {
      throw new Error("Descrição deve ter no máximo 255 caracteres");
    }
  }
}

module.exports = TransferToInvestment;
