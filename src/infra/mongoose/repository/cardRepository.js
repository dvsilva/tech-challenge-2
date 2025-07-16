const { Card } = require("../modelos");

const create = async (userData) => {
  const card = new Card(userData);
  return card.save();
};

const getById = async (id) => {
  return Card.findById(id);
};

const get = async (card = {}) => {
  return Card.find(card);
};

const update = async (id, updateData) => {
  return Card.findByIdAndUpdate(id, updateData, { new: true });
};

const deleteById = async (id) => {
  return Card.findByIdAndDelete(id);
};

const deleteMany = async (filter) => {
  return Card.deleteMany(filter);
};

module.exports = {
  create,
  getById,
  get,
  update,
  deleteById,
  deleteMany,
};
