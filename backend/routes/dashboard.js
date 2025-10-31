const express = require("express");
const router = express.Router();
const dashboardCtrl = require("../controllers/dashboardController");

router.get("/summary", dashboardCtrl.getSummary);
router.get("/seller/:userId", dashboardCtrl.getSellerDashboard);
module.exports = router;
