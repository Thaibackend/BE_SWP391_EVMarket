const express = require("express");
const router = express.Router();
const userPackageController = require("../controllers/userPackageController");

router.get("/cancelled/:userId", userPackageController.getCancelledPackages);

module.exports = router;
