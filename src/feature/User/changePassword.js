module.exports = async ({
  userId,
  newPassword,
  currentPassword,
  repository,
}) => {
  if (!userId) {
    throw new Error("ID do usuário é obrigatório");
  }

  if (!newPassword) {
    throw new Error("Nova senha é obrigatória");
  }

  if (!currentPassword) {
    throw new Error("Senha atual é obrigatória");
  }

  try {
    // Verificar se o usuário existe e a senha atual está correta
    const user = await repository.findOne({
      _id: userId,
      password: currentPassword,
    });
    if (!user) {
      throw new Error("Usuário não encontrado ou senha atual incorreta");
    }

    // Atualizar a senha
    const updatedUser = await repository.findByIdAndUpdate(
      userId,
      { password: newPassword },
      { new: true }
    );

    return updatedUser;
  } catch (error) {
    throw error;
  }
};
