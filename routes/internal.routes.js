const express = require("express");
const internalController = require("../controllers/internal.controller");
const internalAuth = require("../middleware/internalAuth.middleware");

const router = express.Router();
router.use(internalAuth);

router.get("/by-email/:email", internalController.getUserByEmail);
router.post("/", internalController.createUser);
router.get("/:id", internalController.getUserById);

module.exports = router;
