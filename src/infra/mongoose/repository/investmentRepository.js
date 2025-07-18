const { Investment } = require("../modelos");

class InvestmentRepository {
  async save(investment) {
    try {
      const savedInvestment = await Investment.create(investment);
      return savedInvestment;
    } catch (error) {
      throw new Error(`Erro ao salvar investimento: ${error.message}`);
    }
  }

  async findByAccountId(accountId) {
    try {
      const investments = await Investment.find({ accountId })
        .populate("accountId", "accountNumber type")
        .sort({ createdAt: -1 });
      return investments;
    } catch (error) {
      throw new Error(`Erro ao buscar investimentos: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const investment = await Investment.findById(id).populate(
        "accountId",
        "accountNumber type"
      );
      return investment;
    } catch (error) {
      throw new Error(`Erro ao buscar investimento: ${error.message}`);
    }
  }

  async findByType(accountId, type) {
    try {
      const investments = await Investment.find({ accountId, type })
        .populate("accountId", "accountNumber type")
        .sort({ createdAt: -1 });
      return investments;
    } catch (error) {
      throw new Error(
        `Erro ao buscar investimentos por tipo: ${error.message}`
      );
    }
  }

  async update(id, updateData) {
    try {
      const updatedInvestment = await Investment.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate("accountId", "accountNumber type");
      return updatedInvestment;
    } catch (error) {
      throw new Error(`Erro ao atualizar investimento: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const deletedInvestment = await Investment.findByIdAndDelete(id);
      return deletedInvestment;
    } catch (error) {
      throw new Error(`Erro ao deletar investimento: ${error.message}`);
    }
  }

  async getTotalInvestmentsByAccount(accountId) {
    try {
      const result = await Investment.aggregate([
        { $match: { accountId } },
        {
          $group: {
            _id: null,
            totalValue: { $sum: "$value" },
            totalInitialValue: { $sum: "$initialValue" },
            count: { $sum: 1 },
          },
        },
      ]);
      return result[0] || { totalValue: 0, totalInitialValue: 0, count: 0 };
    } catch (error) {
      throw new Error(
        `Erro ao calcular total de investimentos: ${error.message}`
      );
    }
  }

  async getInvestmentsByCategory(accountId) {
    try {
      const result = await Investment.aggregate([
        { $match: { accountId } },
        {
          $group: {
            _id: "$category",
            totalValue: { $sum: "$value" },
            totalInitialValue: { $sum: "$initialValue" },
            count: { $sum: 1 },
            averageYield: { $avg: "$currentYield" },
          },
        },
      ]);
      return result;
    } catch (error) {
      throw new Error(
        `Erro ao buscar investimentos por categoria: ${error.message}`
      );
    }
  }

  async findByCategory(accountId, category) {
    try {
      const investments = await Investment.find({ accountId, category })
        .populate("accountId", "accountNumber type")
        .sort({ createdAt: -1 });
      return investments;
    } catch (error) {
      throw new Error(
        `Erro ao buscar investimentos por categoria: ${error.message}`
      );
    }
  }
}

module.exports = InvestmentRepository;
