const express = require("express");
const router = express.Router();
const payosController = require("../controllers/payosController");

router.post("/create-payment", payosController.createPayment);
router.get("/payment-status/:orderId", payosController.paymentStatus);

module.exports = router;
