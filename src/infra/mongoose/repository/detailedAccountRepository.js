const { DetailedAccount } = require("../modelos");

const create = async (action) => {
  const detailedAccount = new DetailedAccount(action);
  return detailedAccount.save();
};

const getById = async (id) => {
  return DetailedAccount.findById(id);
};

const get = async (detailedAccount = {}) => {
  return DetailedAccount.find(detailedAccount);
};

const getWithFiltersAndPagination = async ({
  filter = {},
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
}) => {
  // Construir o filtro de busca
  const searchFilter = { ...filter };

  // Aplicar filtro de data
  if (startDate || endDate) {
    searchFilter.date = {};
    if (startDate) searchFilter.date.$gte = new Date(startDate);
    if (endDate) searchFilter.date.$lte = new Date(endDate);
  }

  // Aplicar filtro de tipo
  if (type) {
    searchFilter.type = type;
  }

  // Aplicar filtro de origem (from) - busca parcial case-insensitive
  if (from) {
    searchFilter.from = { $regex: from, $options: "i" };
  }

  // Aplicar filtro de destino (to) - busca parcial case-insensitive
  if (to) {
    searchFilter.to = { $regex: to, $options: "i" };
  }

  // Aplicar filtro de descrição - busca parcial case-insensitive
  if (description) {
    searchFilter.description = { $regex: description, $options: "i" };
  }

  // Aplicar filtro de anexo - busca parcial case-insensitive
  if (anexo) {
    searchFilter.anexo = { $regex: anexo, $options: "i" };
  }

  // Calcular paginação
  const skip = (page - 1) * limit;
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  // Buscar transações com filtros e paginação
  const transactions = await DetailedAccount.find(searchFilter)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);

  // Contar total de documentos para paginação
  const totalCount = await DetailedAccount.countDocuments(searchFilter);

  return {
    transactions,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPreviousPage: page > 1,
      limit,
    },
  };
};

const update = async (id, updateData) => {
  return DetailedAccount.findByIdAndUpdate(id, updateData, { new: true });
};

const deleteById = async (id) => {
  return DetailedAccount.findByIdAndDelete(id);
};

module.exports = {
  create,
  getById,
  get,
  getWithFiltersAndPagination,
  update,
  deleteById,
};
