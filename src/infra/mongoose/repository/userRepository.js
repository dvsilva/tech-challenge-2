const { User } = require("../modelos");

const create = async (userData) => {
  const user = new User(userData);
  return user.save();
};

const getById = async (id) => {
  return User.findById(id);
};

const get = async (user = {}) => {
  return User.find(user);
};

const findById = async (id) => {
  return User.findById(id);
};

const findByIdAndUpdate = async (id, updateData, options = {}) => {
  return User.findByIdAndUpdate(id, updateData, options);
};

const findByIdAndDelete = async (id) => {
  return User.findByIdAndDelete(id);
};

const findOne = async (filter) => {
  return User.findOne(filter);
};

module.exports = {
  create,
  getById,
  get,
  findById,
  findByIdAndUpdate,
  findByIdAndDelete,
  findOne,
};
