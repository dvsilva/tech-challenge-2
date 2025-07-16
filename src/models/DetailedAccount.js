class DetailedAccount {
  constructor({
    _id,
    type,
    amount,
    from,
    to,
    date,
    accountId,
    anexo,
    description,
  }) {
    this.id = _id;
    this.accountId = accountId;
    this.type = type;
    this.amount = amount;
    this.from = from;
    this.to = to;
    this.date = date;
    this.anexo = anexo;
    this.description = description;
  }
}

module.exports = DetailedAccount;
