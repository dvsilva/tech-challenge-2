const TransactionDTO = require("../models/DetailedAccount");

class AccountController {
  constructor(di = {}) {
    this.di = Object.assign(
      {
        userRepository: require("../infra/mongoose/repository/userRepository"),
        accountRepository: require("../infra/mongoose/repository/accountRepository"),
        cardRepository: require("../infra/mongoose/repository/cardRepository"),
        transactionRepository: require("../infra/mongoose/repository/detailedAccountRepository"),

        saveCard: require("../feature/Card/saveCard"),
        salvarUsuario: require("../feature/User/salvarUsuario"),
        saveAccount: require("../feature/Account/saveAccount"),
        getUser: require("../feature/User/getUser"),
        getAccount: require("../feature/Account/getAccount"),
        saveTransaction: require("../feature/Transaction/saveTransaction"),
        getTransaction: require("../feature/Transaction/getTransaction"),
        getTransactionWithFilters: require("../feature/Transaction/getTransactionWithFilters"),
        updateTransaction: require("../feature/Transaction/updateTransaction"),
        deleteTransaction: require("../feature/Transaction/deleteTransaction"),
        getCard: require("../feature/Card/getCard"),
      },
      di
    );
  }

  async find(req, res) {
    const {
      accountRepository,
      getAccount,
      getCard,
      getTransaction,
      transactionRepository,
      cardRepository,
    } = this.di;

    try {
      const userId = req.user.id;
      const account = await getAccount({
        repository: accountRepository,
        filter: { userId },
      });
      const transactions = await getTransaction({
        filter: { accountId: account[0].id },
        repository: transactionRepository,
      });
      const cards = await getCard({
        filter: { accountId: account[0].id },
        repository: cardRepository,
      });

      res.status(200).json({
        message: "Conta encontrada carregado com sucesso",
        result: {
          account,
          transactions,
          cards,
        },
      });
    } catch (error) {
      res.status(500).json({
        message: "Erro no servidor",
      });
    }
  }

  async createTransaction(req, res) {
    const { saveTransaction, transactionRepository } = this.di;
    const { accountId, value, type, from, to, anexo, description } = req.body;
    const transactionDTO = new TransactionDTO({
      accountId,
      value,
      from,
      to,
      anexo,
      description,
      type,
      date: new Date(),
    });

    try {
      const transaction = await saveTransaction({
        transaction: transactionDTO,
        repository: transactionRepository,
      });

      res.status(201).json({
        message: "Transação criada com sucesso",
        result: transaction,
      });
    } catch (error) {
      res.status(500).json({
        message: "Erro ao criar transação",
        error: error.message,
      });
    }
  }

  async updateTransaction(req, res) {
    const { updateTransaction, transactionRepository } = this.di;
    const { transactionId } = req.params;
    const updateData = req.body;

    try {
      const transaction = await updateTransaction({
        transactionId,
        updateData,
        repository: transactionRepository,
      });

      res.status(200).json({
        message: "Transação atualizada com sucesso",
        result: transaction,
      });
    } catch (error) {
      res
        .status(error.message === "Transação não encontrada" ? 404 : 500)
        .json({
          message:
            error.message === "Transação não encontrada"
              ? "Transação não encontrada"
              : "Erro ao atualizar transação",
          error: error.message,
        });
    }
  }

  async deleteTransaction(req, res) {
    const { deleteTransaction, transactionRepository } = this.di;
    const { transactionId } = req.params;

    try {
      await deleteTransaction({
        transactionId,
        repository: transactionRepository,
      });

      res.status(200).json({
        message: "Transação excluída com sucesso",
      });
    } catch (error) {
      res
        .status(error.message === "Transação não encontrada" ? 404 : 500)
        .json({
          message:
            error.message === "Transação não encontrada"
              ? "Transação não encontrada"
              : "Erro ao excluir transação",
          error: error.message,
        });
    }
  }

  async getStatement(req, res) {
    const { getTransactionWithFilters, transactionRepository } = this.di;

    const { accountId } = req.params;
    const {
      startDate,
      endDate,
      type,
      page = 1,
      limit = 10,
      sortBy = "date",
      sortOrder = "desc",
    } = req.query;

    try {
      const result = await getTransactionWithFilters({
        filter: { accountId },
        startDate,
        endDate,
        type,
        page,
        limit,
        sortBy,
        sortOrder,
        repository: transactionRepository,
      });

      res.status(200).json({
        message: "Extrato obtido com sucesso",
        result: {
          transactions: result.transactions,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      res.status(500).json({
        message: "Erro ao obter extrato",
        error: error.message,
      });
    }
  }
}

module.exports = AccountController;
