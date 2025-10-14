const express = require("express");
const router = express.Router();
const pinController = require("../controllers/pinController");

router.post("/", pinController.create);

module.exports = router;
