const CardModel = require("../../models/Card");

const getCardById = async ({ cardId, repository }) => {
  const resultado = await repository.getById(cardId);
  if (!resultado) {
    throw new Error("Cartão não encontrado");
  }
  return new CardModel(resultado.toJSON());
};

module.exports = getCardById;
