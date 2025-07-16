const DetailedAccountModel = require("../../models/DetailedAccount");

const updateTransaction = async ({ transactionId, updateData, repository }) => {
  // Aplica a lógica de reversão de valor se necessário
  if (updateData.type && updateData.amount !== undefined) {
    const shouldReverseAmount =
      (updateData.type === "transfer" && updateData.amount > 0) ||
      ((updateData.type === "exchange" || updateData.type === "loan") &&
        updateData.amount < 0);
    if (shouldReverseAmount) updateData.amount = updateData.amount * -1;
  }

  const resultado = await repository.update(transactionId, updateData);
  if (!resultado) {
    throw new Error("Transação não encontrada");
  }
  return new DetailedAccountModel(resultado.toJSON());
};

module.exports = updateTransaction;
