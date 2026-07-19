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

module.exports = { getUserById };
