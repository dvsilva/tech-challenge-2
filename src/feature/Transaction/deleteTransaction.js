const deleteTransaction = async ({ transactionId, repository }) => {
  const resultado = await repository.deleteById(transactionId);
  if (!resultado) {
    throw new Error("Transação não encontrada");
  }
  return resultado;
};

module.exports = deleteTransaction;
