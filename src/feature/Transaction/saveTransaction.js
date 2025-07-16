const DetailedAccountModel = require("../../models/DetailedAccount");

const saveTransaction = async ({ transaction, repository }) => {
  const shouldReverseAmount =
    (transaction.type === "transfer" && transaction.amount > 0) ||
    ((transaction.type === "exchange" || transaction.type === "loan") &&
      transaction.amount < 0);
  if (shouldReverseAmount) transaction.amount = transaction.amount * -1;

  const resultado = await repository.create(transaction);
  return new DetailedAccountModel(resultado.toJSON());
};

module.exports = saveTransaction;
