const express = require("express");
const router = express.Router();
const payosController = require("../controllers/payosController");

router.post("/create-payment", payosController.createPayment);

module.exports = router;
