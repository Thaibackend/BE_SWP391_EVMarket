const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/", userController.getAll);
router.get("/:id", userController.getById);
router.patch("/:id", userController.update);
router.patch("/:id/ban", userController.banToggle);

module.exports = router;
