const deleteCard = async ({ cardId, repository }) => {
  const resultado = await repository.deleteById(cardId);
  if (!resultado) {
    throw new Error("Cartão não encontrado");
  }
  return resultado;
};

module.exports = deleteCard;
