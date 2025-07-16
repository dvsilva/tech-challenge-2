class Investment {
  constructor({ id, type, value, name, accountId }) {
    this.id = id;
    this.type = type;
    this.value = value;
    this.name = name;
    this.accountId = accountId;
  }
}

module.exports = Investment;
