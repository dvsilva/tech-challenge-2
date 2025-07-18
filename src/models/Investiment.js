class Investment {
  constructor({
    id,
    type,
    category,
    subtype,
    name,
    value,
    initialValue,
    currentYield,
    riskLevel,
    purchaseDate,
    maturityDate,
    accountId,
  }) {
    this.id = id;
    this.type = type;
    this.category = category;
    this.subtype = subtype;
    this.name = name;
    this.value = value;
    this.initialValue = initialValue;
    this.currentYield = currentYield;
    this.riskLevel = riskLevel;
    this.purchaseDate = purchaseDate;
    this.maturityDate = maturityDate;
    this.accountId = accountId;
  }
}

module.exports = Investment;
