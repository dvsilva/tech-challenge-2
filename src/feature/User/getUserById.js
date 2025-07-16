module.exports = async ({ userId, repository }) => {
  if (!userId) {
    throw new Error("ID do usuário é obrigatório");
  }

  try {
    const user = await repository.findById(userId);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }
    return user;
  } catch (error) {
    throw error;
  }
};
