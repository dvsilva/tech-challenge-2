module.exports = async ({ userId, userData, repository }) => {
  if (!userId) {
    throw new Error("ID do usuário é obrigatório");
  }

  if (!userData) {
    throw new Error("Dados para atualização são obrigatórios");
  }

  try {
    // Remove campos que não devem ser atualizados diretamente
    const allowedFields = ["name", "username", "email"];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (userData[field] !== undefined) {
        updateData[field] = userData[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      throw new Error("Nenhum campo válido para atualização foi fornecido");
    }

    const updatedUser = await repository.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    if (!updatedUser) {
      throw new Error("Usuário não encontrado");
    }

    return updatedUser;
  } catch (error) {
    throw error;
  }
};
