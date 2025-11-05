const express = require("express");
const router = express.Router();
const controller = require("../controllers/zalopayController");

router.post("/create-payment", controller.createPayment);

router.post("/callback", controller.callback);

module.exports = router;
