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
        getCard: require("../feature/Card/getCard"),
        getCardById: require("../feature/Card/getCardById"),
        updateCard: require("../feature/Card/updateCard"),
        deleteCard: require("../feature/Card/deleteCard"),
        salvarUsuario: require("../feature/User/salvarUsuario"),
        saveAccount: require("../feature/Account/saveAccount"),
        getUser: require("../feature/User/getUser"),
        getAccount: require("../feature/Account/getAccount"),
        saveTransaction: require("../feature/Transaction/saveTransaction"),
        getTransaction: require("../feature/Transaction/getTransaction"),
        getTransactionWithFilters: require("../feature/Transaction/getTransactionWithFilters"),
        updateTransaction: require("../feature/Transaction/updateTransaction"),
        deleteTransaction: require("../feature/Transaction/deleteTransaction"),
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
    const { accountId, amount, type, from, to, anexo, description } = req.body;
    const transactionDTO = new TransactionDTO({
      accountId,
      amount,
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
      from,
      to,
      description,
      anexo,
      minValue,
      maxValue,
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
        from,
        to,
        description,
        anexo,
        minValue,
        maxValue,
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

  // CRUD Methods for Cards
  async createCard(req, res) {
    const { saveCard, cardRepository } = this.di;
    const {
      accountId,
      type,
      number,
      dueDate,
      functions,
      cvc,
      paymentDate,
      name,
    } = req.body;
    const CardDTO = require("../models/Card");

    const cardData = new CardDTO({
      accountId,
      type,
      number,
      dueDate: new Date(dueDate),
      functions,
      cvc,
      paymentDate: paymentDate ? new Date(paymentDate) : null,
      name,
      is_blocked: false,
    });

    try {
      const card = await saveCard({
        card: cardData,
        repository: cardRepository,
      });

      res.status(201).json({
        message: "Cartão criado com sucesso",
        result: card,
      });
    } catch (error) {
      res.status(500).json({
        message: "Erro ao criar cartão",
        error: error.message,
      });
    }
  }

  async getCardById(req, res) {
    const { getCardById, cardRepository } = this.di;
    const { cardId } = req.params;

    try {
      const card = await getCardById({
        cardId,
        repository: cardRepository,
      });

      res.status(200).json({
        message: "Cartão encontrado com sucesso",
        result: card,
      });
    } catch (error) {
      res.status(error.message === "Cartão não encontrado" ? 404 : 500).json({
        message:
          error.message === "Cartão não encontrado"
            ? "Cartão não encontrado"
            : "Erro ao buscar cartão",
        error: error.message,
      });
    }
  }

  async getAllCards(req, res) {
    const { getCard, cardRepository } = this.di;
    const { accountId } = req.query;

    try {
      const filter = accountId ? { accountId } : {};
      const cards = await getCard({
        filter,
        repository: cardRepository,
      });

      res.status(200).json({
        message: "Cartões encontrados com sucesso",
        result: cards,
      });
    } catch (error) {
      res.status(500).json({
        message: "Erro ao buscar cartões",
        error: error.message,
      });
    }
  }

  async updateCard(req, res) {
    const { updateCard, cardRepository } = this.di;
    const { cardId } = req.params;
    const updateData = req.body;

    // Convert date strings to Date objects if present
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }
    if (updateData.paymentDate) {
      updateData.paymentDate = new Date(updateData.paymentDate);
    }

    try {
      const card = await updateCard({
        cardId,
        updateData,
        repository: cardRepository,
      });

      res.status(200).json({
        message: "Cartão atualizado com sucesso",
        result: card,
      });
    } catch (error) {
      res.status(error.message === "Cartão não encontrado" ? 404 : 500).json({
        message:
          error.message === "Cartão não encontrado"
            ? "Cartão não encontrado"
            : "Erro ao atualizar cartão",
        error: error.message,
      });
    }
  }

  async deleteCard(req, res) {
    const { deleteCard, cardRepository } = this.di;
    const { cardId } = req.params;

    try {
      await deleteCard({
        cardId,
        repository: cardRepository,
      });

      res.status(200).json({
        message: "Cartão excluído com sucesso",
      });
    } catch (error) {
      res.status(error.message === "Cartão não encontrado" ? 404 : 500).json({
        message:
          error.message === "Cartão não encontrado"
            ? "Cartão não encontrado"
            : "Erro ao excluir cartão",
        error: error.message,
      });
    }
  }

  async toggleCardBlock(req, res) {
    const { updateCard, cardRepository } = this.di;
    const { cardId } = req.params;
    const { is_blocked } = req.body;

    try {
      const card = await updateCard({
        cardId,
        updateData: { is_blocked },
        repository: cardRepository,
      });

      res.status(200).json({
        message: `Cartão ${
          is_blocked ? "bloqueado" : "desbloqueado"
        } com sucesso`,
        result: card,
      });
    } catch (error) {
      res.status(error.message === "Cartão não encontrado" ? 404 : 500).json({
        message:
          error.message === "Cartão não encontrado"
            ? "Cartão não encontrado"
            : "Erro ao alterar status do cartão",
        error: error.message,
      });
    }
  }
}

module.exports = AccountController;
