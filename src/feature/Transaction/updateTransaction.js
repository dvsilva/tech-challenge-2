const DetailedAccountModel = require("../../models/DetailedAccount");

const updateTransaction = async ({ transactionId, updateData, repository }) => {
  // Aplica a lógica de reversão de valor se necessário
  if (updateData.type && updateData.value !== undefined) {
    const shouldReverseValue =
      (updateData.type === "Debit" && updateData.value > 0) ||
      (updateData.type === "Credit" && updateData.value < 0);
    if (shouldReverseValue) updateData.value = updateData.value * -1;
  }

  const resultado = await repository.update(transactionId, updateData);
  if (!resultado) {
    throw new Error("Transação não encontrada");
  }
  return new DetailedAccountModel(resultado.toJSON());
};

module.exports = updateTransaction;
