module.exports = async ({
  userId,
  repository,
  accountRepository,
  cardRepository,
}) => {
  if (!userId) {
    throw new Error("ID do usuário é obrigatório");
  }

  try {
    // Verificar se o usuário existe
    const user = await repository.findById(userId);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    // Remover cartões associados às contas do usuário
    if (cardRepository) {
      const userAccounts = await accountRepository.find({ userId });
      for (const account of userAccounts) {
        await cardRepository.deleteMany({ accountId: account._id });
      }
    }

    // Remover contas do usuário
    if (accountRepository) {
      await accountRepository.deleteMany({ userId });
    }

    // Remover o usuário
    const deletedUser = await repository.findByIdAndDelete(userId);

    return deletedUser;
  } catch (error) {
    throw error;
  }
};
