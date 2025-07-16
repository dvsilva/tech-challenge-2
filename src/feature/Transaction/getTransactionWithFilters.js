const DetailedAccountModel = require("../../models/DetailedAccount");

const getTransactionWithFilters = async ({
  filter,
  startDate,
  endDate,
  type,
  from,
  to,
  description,
  anexo,
  page = 1,
  limit = 10,
  sortBy = "date",
  sortOrder = "desc",
  repository,
}) => {
  const result = await repository.getWithFiltersAndPagination({
    filter,
    startDate,
    endDate,
    type,
    from,
    to,
    description,
    anexo,
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy,
    sortOrder,
  });

  return {
    transactions: result.transactions?.map(
      (transaction) => new DetailedAccountModel(transaction)
    ),
    pagination: result.pagination,
  };
};

module.exports = getTransactionWithFilters;
