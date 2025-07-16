module.exports = async ({ userId, settings, repository }) => {
  if (!userId) {
    throw new Error("ID do usuário é obrigatório");
  }

  if (!settings) {
    throw new Error("Configurações são obrigatórias");
  }

  try {
    // Verificar se o usuário existe
    const user = await repository.findById(userId);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    // Configurações padrão permitidas
    const allowedSettings = {
      notifications: settings.notifications || true,
      language: settings.language || "pt-BR",
      currency: settings.currency || "BRL",
      twoFactorAuth: settings.twoFactorAuth || false,
      emailAlerts: settings.emailAlerts || true,
      smsAlerts: settings.smsAlerts || false,
      theme: settings.theme || "light",
    };

    // Atualizar configurações do usuário
    const updatedUser = await repository.findByIdAndUpdate(
      userId,
      { settings: allowedSettings },
      { new: true }
    );

    return updatedUser;
  } catch (error) {
    throw error;
  }
};
