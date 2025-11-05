const express = require("express");
const router = express.Router();
const vnpayController = require("../controllers/vnpayController");

router.post("/create_payment", vnpayController.createPayment);
router.get("/vnpay_return", vnpayController.vnpayReturn);

module.exports = router;
