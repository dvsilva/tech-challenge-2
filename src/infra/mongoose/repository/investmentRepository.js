const { Investment } = require("../modelos");
const mongoose = require("mongoose");

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
      const objectId = new mongoose.Types.ObjectId(accountId);

      const investments = await Investment.find({ accountId: objectId })
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
      const objectId = new mongoose.Types.ObjectId(accountId);

      const investments = await Investment.find({ accountId: objectId, type })
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
      const objectId = new mongoose.Types.ObjectId(accountId);

      const result = await Investment.aggregate([
        { $match: { accountId: objectId } },
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

  async getTotalInvestmentsByAccountWithFilters(accountId, filters = {}) {
    try {
      const objectId = new mongoose.Types.ObjectId(accountId);

      // Build the match query with filters
      const matchQuery = { accountId: objectId };

      // Add filters dynamically
      if (filters.type) {
        matchQuery.type = filters.type;
      }

      if (filters.category) {
        matchQuery.category = filters.category;
      }

      if (filters.subtype) {
        matchQuery.subtype = filters.subtype;
      }

      if (filters.riskLevel) {
        matchQuery.riskLevel = filters.riskLevel;
      }

      // Date range filters
      if (filters.purchaseDateFrom || filters.purchaseDateTo) {
        matchQuery.purchaseDate = {};
        if (filters.purchaseDateFrom) {
          matchQuery.purchaseDate.$gte = new Date(filters.purchaseDateFrom);
        }
        if (filters.purchaseDateTo) {
          matchQuery.purchaseDate.$lte = new Date(filters.purchaseDateTo);
        }
      }

      // Value range filters
      if (filters.minValue || filters.maxValue) {
        matchQuery.value = {};
        if (filters.minValue) {
          matchQuery.value.$gte = Number(filters.minValue);
        }
        if (filters.maxValue) {
          matchQuery.value.$lte = Number(filters.maxValue);
        }
      }

      // Maturity status filter
      if (filters.isMatured !== undefined) {
        const now = new Date();
        if (filters.isMatured === true || filters.isMatured === "true") {
          matchQuery.maturityDate = { $lte: now };
        } else if (
          filters.isMatured === false ||
          filters.isMatured === "false"
        ) {
          matchQuery.$or = [
            { maturityDate: { $gt: now } },
            { maturityDate: { $exists: false } },
            { maturityDate: null },
          ];
        }
      }

      const result = await Investment.aggregate([
        { $match: matchQuery },
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
        `Erro ao calcular total de investimentos com filtros: ${error.message}`
      );
    }
  }

  async getInvestmentsByCategory(accountId) {
    try {
      const objectId = new mongoose.Types.ObjectId(accountId);

      const result = await Investment.aggregate([
        { $match: { accountId: objectId } },
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

  async getInvestmentsByCategoryWithFilters(accountId, filters = {}) {
    try {
      const objectId = new mongoose.Types.ObjectId(accountId);

      // Build the match query with filters
      const matchQuery = { accountId: objectId };

      // Add filters dynamically
      if (filters.type) {
        matchQuery.type = filters.type;
      }

      if (filters.category) {
        matchQuery.category = filters.category;
      }

      if (filters.subtype) {
        matchQuery.subtype = filters.subtype;
      }

      if (filters.riskLevel) {
        matchQuery.riskLevel = filters.riskLevel;
      }

      // Date range filters
      if (filters.purchaseDateFrom || filters.purchaseDateTo) {
        matchQuery.purchaseDate = {};
        if (filters.purchaseDateFrom) {
          matchQuery.purchaseDate.$gte = new Date(filters.purchaseDateFrom);
        }
        if (filters.purchaseDateTo) {
          matchQuery.purchaseDate.$lte = new Date(filters.purchaseDateTo);
        }
      }

      // Value range filters
      if (filters.minValue || filters.maxValue) {
        matchQuery.value = {};
        if (filters.minValue) {
          matchQuery.value.$gte = Number(filters.minValue);
        }
        if (filters.maxValue) {
          matchQuery.value.$lte = Number(filters.maxValue);
        }
      }

      // Maturity status filter
      if (filters.isMatured !== undefined) {
        const now = new Date();
        if (filters.isMatured === true || filters.isMatured === "true") {
          matchQuery.maturityDate = { $lte: now };
        } else if (
          filters.isMatured === false ||
          filters.isMatured === "false"
        ) {
          matchQuery.$or = [
            { maturityDate: { $gt: now } },
            { maturityDate: { $exists: false } },
            { maturityDate: null },
          ];
        }
      }

      const result = await Investment.aggregate([
        { $match: matchQuery },
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
        `Erro ao buscar investimentos por categoria com filtros: ${error.message}`
      );
    }
  }

  async findByCategory(accountId, category) {
    try {
      const objectId = new mongoose.Types.ObjectId(accountId);

      const investments = await Investment.find({
        accountId: objectId,
        category,
      })
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
