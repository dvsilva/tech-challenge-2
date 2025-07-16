const CardModel = require("../../models/Card");

const updateCard = async ({ cardId, updateData, repository }) => {
  const resultado = await repository.update(cardId, updateData);
  if (!resultado) {
    throw new Error("Cartão não encontrado");
  }
  return new CardModel(resultado.toJSON());
};

module.exports = updateCard;
