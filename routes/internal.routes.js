const express = require("express");
const internalController = require("../controllers/internal.controller");
const internalAuth = require("../middleware/internalAuth.middleware");

const router = express.Router();
router.use(internalAuth);

router.get("/:id", internalController.getUserById);

module.exports = router;
