const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.post("/", orderController.createOrder);
router.get("/buyer/:userId", orderController.getOrdersByBuyer);
router.get("/seller/:userId", orderController.getOrdersBySeller);
module.exports = router;
