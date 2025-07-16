const DetailedAccountModel = require("../../models/DetailedAccount");

const saveTransaction = async ({ transaction, repository }) => {
  const shouldReverseValue =
    (transaction.type === "transfer" && transaction.value > 0) ||
    ((transaction.type === "exchange" || transaction.type === "loan") &&
      transaction.value < 0);
  if (shouldReverseValue) transaction.value = transaction.value * -1;

  const resultado = await repository.create(transaction);
  return new DetailedAccountModel(resultado.toJSON());
};

module.exports = saveTransaction;
