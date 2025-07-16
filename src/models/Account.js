class Account {
  constructor({ _id, type, userId, accountNumber }) {
    this.id = _id;
    this.type = type;
    this.userId = userId;
    this.accountNumber = accountNumber;
  }
}

module.exports = Account;
