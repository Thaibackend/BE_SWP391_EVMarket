const express = require("express");
const router = express.Router();
const pinController = require("../controllers/pinController");

router.post("/", pinController.create);
router.get("/", pinController.getAll);
router.get("/:id", pinController.getById);

module.exports = router;
