const userDTO = require("../models/User");
const accountDTO = require("../models/Account");
const cardDTO = require("../models/Card");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "tech-challenge";

class UserController {
  constructor(di = {}) {
    this.di = Object.assign(
      {
        userRepository: require("../infra/mongoose/repository/userRepository"),
        accountRepository: require("../infra/mongoose/repository/accountRepository"),
        cardRepository: require("../infra/mongoose/repository/cardRepository"),

        saveCard: require("../feature/Card/saveCard"),
        salvarUsuario: require("../feature/User/salvarUsuario"),
        saveAccount: require("../feature/Account/saveAccount"),
        getUser: require("../feature/User/getUser"),
        getUserById: require("../feature/User/getUserById"),
        updateUser: require("../feature/User/updateUser"),
        deleteUser: require("../feature/User/deleteUser"),
        changePassword: require("../feature/User/changePassword"),
        updateUserSettings: require("../feature/User/updateUserSettings"),
      },
      di
    );
  }

  async create(req, res) {
    const user = new userDTO(req.body);
    const {
      userRepository,
      accountRepository,
      cardRepository,
      salvarUsuario,
      saveAccount,
      saveCard,
    } = this.di;

    if (!user.isValid())
      return res
        .status(400)
        .json({ message: "não houve informações enviadas" });
    try {
      const userCreated = await salvarUsuario({
        user,
        repository: userRepository,
      });

      const accountCreated = await saveAccount({
        account: new accountDTO({
          userId: userCreated.id,
          type: "Debit",
          accountNumber: `AC-${Date.now().toString().slice(-6)}`,
        }),
        repository: accountRepository,
      });

      const firstCard = new cardDTO({
        type: "GOLD",
        number: 13748712374891010,
        dueDate: "2027-01-07",
        functions: "Debit",
        cvc: "505",
        paymentDate: null,
        name: userCreated.name,
        accountId: accountCreated.id,
        type: "Debit",
      });

      const cardCreated = await saveCard({
        card: firstCard,
        repository: cardRepository,
      });

      res.status(201).json({
        message: "usuário criado com sucesso",
        result: userCreated,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "caiu a aplicação" });
    }
  }
  async find(req, res) {
    const { userRepository, getUser } = this.di;
    try {
      const users = await getUser({ repository: userRepository });
      res.status(200).json({
        message: "Usuário carregado com sucesso",
        result: users,
      });
    } catch (error) {
      res.status(500).json({
        message: "Erro no servidor",
      });
    }
  }
  async auth(req, res) {
    const { userRepository, getUser } = this.di;
    const { email, password } = req.body;
    const user = await getUser({
      repository: userRepository,
      userFilter: { email, password },
    });

    if (!user?.[0])
      return res.status(401).json({ message: "Usuário não encontrado" });
    const userToTokenize = { ...user[0], id: user[0].id.toString() };
    res.status(200).json({
      message: "Usuário autenticado com sucesso",
      result: {
        token: jwt.sign(userToTokenize, JWT_SECRET, { expiresIn: "12h" }),
      },
    });
  }

  async findById(req, res) {
    const { userRepository, getUserById } = this.di;
    const { id } = req.params;

    try {
      const user = await getUserById({
        userId: id,
        repository: userRepository,
      });
      res.status(200).json({
        message: "Usuário encontrado com sucesso",
        result: user,
      });
    } catch (error) {
      if (error.message === "Usuário não encontrado") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Erro no servidor" });
    }
  }

  async update(req, res) {
    const { userRepository, updateUser } = this.di;
    const { id } = req.params;
    const userData = req.body;

    try {
      const updatedUser = await updateUser({
        userId: id,
        userData,
        repository: userRepository,
      });
      res.status(200).json({
        message: "Usuário atualizado com sucesso",
        result: updatedUser,
      });
    } catch (error) {
      if (error.message === "Usuário não encontrado") {
        return res.status(404).json({ message: error.message });
      }
      if (error.message.includes("campo válido")) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Erro no servidor" });
    }
  }

  async delete(req, res) {
    const { userRepository, accountRepository, cardRepository, deleteUser } =
      this.di;
    const { id } = req.params;

    try {
      const deletedUser = await deleteUser({
        userId: id,
        repository: userRepository,
        accountRepository,
        cardRepository,
      });
      res.status(200).json({
        message: "Usuário excluído com sucesso",
        result: deletedUser,
      });
    } catch (error) {
      if (error.message === "Usuário não encontrado") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Erro no servidor" });
    }
  }

  async changePassword(req, res) {
    const { userRepository, changePassword } = this.di;
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    try {
      const updatedUser = await changePassword({
        userId: id,
        currentPassword,
        newPassword,
        repository: userRepository,
      });
      res.status(200).json({
        message: "Senha alterada com sucesso",
        result: { id: updatedUser.id, message: "Senha atualizada" },
      });
    } catch (error) {
      if (
        error.message.includes("não encontrado") ||
        error.message.includes("incorreta")
      ) {
        return res.status(404).json({ message: error.message });
      }
      if (error.message.includes("obrigatória")) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Erro no servidor" });
    }
  }

  async updateSettings(req, res) {
    const { userRepository, updateUserSettings } = this.di;
    const { id } = req.params;
    const settings = req.body;

    try {
      const updatedUser = await updateUserSettings({
        userId: id,
        settings,
        repository: userRepository,
      });
      res.status(200).json({
        message: "Configurações atualizadas com sucesso",
        result: updatedUser,
      });
    } catch (error) {
      if (error.message === "Usuário não encontrado") {
        return res.status(404).json({ message: error.message });
      }
      if (error.message.includes("obrigatórias")) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Erro no servidor" });
    }
  }

  async getSettings(req, res) {
    const { userRepository, getUserById } = this.di;
    const { id } = req.params;

    try {
      const user = await getUserById({
        userId: id,
        repository: userRepository,
      });
      res.status(200).json({
        message: "Configurações encontradas com sucesso",
        result: user.settings || {
          notifications: true,
          language: "pt-BR",
          currency: "BRL",
          twoFactorAuth: false,
          emailAlerts: true,
          smsAlerts: false,
          theme: "light",
        },
      });
    } catch (error) {
      if (error.message === "Usuário não encontrado") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Erro no servidor" });
    }
  }
  static getToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      return null;
    }
  }
}

module.exports = UserController;
