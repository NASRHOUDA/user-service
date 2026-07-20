const { User } = require("../models");

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: ["id", "name", "email"] });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const getUserByEmail = async (req, res, next) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const user = await User.findOne({ where: { email }, attributes: ["id", "name", "email"] });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: "email and name are required" });
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email already exists" });
    }
    const user = await User.create({ email, name });
    res.status(201).json({ id: user.id, email: user.email, name: user.name });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserById, getUserByEmail, createUser };
