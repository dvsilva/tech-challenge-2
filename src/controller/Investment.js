const SaveInvestment = require("../feature/Investment/saveInvestment");
const GetInvestment = require("../feature/Investment/getInvestment");
const GetInvestmentById = require("../feature/Investment/getInvestmentById");
const UpdateInvestment = require("../feature/Investment/updateInvestment");
const DeleteInvestment = require("../feature/Investment/deleteInvestment");
const TransferToInvestment = require("../feature/Investment/transferToInvestment");
const RedeemInvestment = require("../feature/Investment/redeemInvestment");
const jwt = require("jsonwebtoken");

class InvestmentController {
  constructor() {
    this.saveInvestment = new SaveInvestment();
    this.getInvestment = new GetInvestment();
    this.getInvestmentById = new GetInvestmentById();
    this.updateInvestment = new UpdateInvestment();
    this.deleteInvestment = new DeleteInvestment();
    this.transferToInvestment = new TransferToInvestment();
    this.redeemInvestment = new RedeemInvestment();
  }

  async create(req, res) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const accountId = decoded.accountId;

      const result = await this.saveInvestment.execute(req.body, accountId);

      if (result.success) {
        return res.status(201).json({
          message: result.message,
          result: result.investment,
        });
      } else {
        return res.status(400).json({
          message: result.message,
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: "Erro interno do servidor",
        error: error.message,
      });
    }
  }

  async find(req, res) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const accountId = decoded.accountId;

      const filters = {
        type: req.query.type,
        category: req.query.category,
      };

      const result = await this.getInvestment.execute(accountId, filters);

      if (result.success) {
        return res.status(200).json({
          message: result.message,
          result: {
            investments: result.investments,
            summary: result.summary,
            count: result.count,
          },
        });
      } else {
        return res.status(400).json({
          message: result.message,
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: "Erro interno do servidor",
        error: error.message,
      });
    }
  }

  async findById(req, res) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const accountId = decoded.accountId;
      const investmentId = req.params.id;

      const result = await this.getInvestmentById.execute(
        investmentId,
        accountId
      );

      if (result.success) {
        return res.status(200).json({
          message: result.message,
          result: result.investment,
        });
      } else {
        return res.status(404).json({
          message: result.message,
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: "Erro interno do servidor",
        error: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const accountId = decoded.accountId;
      const investmentId = req.params.id;

      const result = await this.updateInvestment.execute(
        investmentId,
        req.body,
        accountId
      );

      if (result.success) {
        return res.status(200).json({
          message: result.message,
          result: result.investment,
        });
      } else {
        return res.status(400).json({
          message: result.message,
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: "Erro interno do servidor",
        error: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const accountId = decoded.accountId;
      const investmentId = req.params.id;

      const result = await this.deleteInvestment.execute(
        investmentId,
        accountId
      );

      if (result.success) {
        return res.status(200).json({
          message: result.message,
          result: result.deletedInvestment,
        });
      } else {
        return res.status(400).json({
          message: result.message,
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: "Erro interno do servidor",
        error: error.message,
      });
    }
  }

  async transfer(req, res) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const accountId = decoded.accountId;

      const result = await this.transferToInvestment.execute(
        req.body,
        accountId
      );

      if (result.success) {
        return res.status(200).json({
          message: result.message,
          result: {
            investment: result.investment,
            transaction: result.transaction,
            transferAmount: result.transferAmount,
            newInvestmentValue: result.newInvestmentValue,
          },
        });
      } else {
        return res.status(400).json({
          message: result.message,
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: "Erro interno do servidor",
        error: error.message,
      });
    }
  }

  async redeem(req, res) {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const accountId = decoded.accountId;

      const result = await this.redeemInvestment.execute(req.body, accountId);

      if (result.success) {
        return res.status(200).json({
          message: result.message,
          result: {
            investment: result.investment,
            transaction: result.transaction,
            redeemedAmount: result.redeemedAmount,
            redeemType: result.redeemType,
            investmentCompletelyRedeemed: result.investmentCompletelyRedeemed,
            newInvestmentValue: result.newInvestmentValue,
            originalInvestmentValue: result.originalInvestmentValue,
          },
        });
      } else {
        return res.status(400).json({
          message: result.message,
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: "Erro interno do servidor",
        error: error.message,
      });
    }
  }

  // Método para obter tipos e categorias disponíveis
  async getInvestmentTypes(req, res) {
    try {
      const investmentTypes = {
        types: [
          { value: "renda_fixa", label: "Renda Fixa" },
          { value: "renda_variavel", label: "Renda Variável" },
        ],
        categories: [
          { value: "fundos_investimento", label: "Fundos de Investimento" },
          { value: "previdencia_privada", label: "Previdência Privada" },
          { value: "bolsa_valores", label: "Bolsa de Valores" },
        ],
        subtypes: {
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
        },
        riskLevels: [
          { value: "baixo", label: "Baixo" },
          { value: "medio", label: "Médio" },
          { value: "alto", label: "Alto" },
        ],
      };

      return res.status(200).json({
        message: "Tipos de investimento carregados com sucesso",
        result: investmentTypes,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Erro interno do servidor",
        error: error.message,
      });
    }
  }
}

module.exports = InvestmentController;
