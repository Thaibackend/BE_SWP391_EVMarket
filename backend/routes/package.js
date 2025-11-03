const express = require("express");
const router = express.Router();
const packageController = require("../controllers/packageController");

router.post("/", packageController.createPackage);

router.get("/", packageController.listPackages);

router.post("/assign", packageController.assignPackageToUser);

router.get("/user/:userId", packageController.getUserPackages);

router.get("/:packageId/user-count", packageController.getUserCountByPackage);

router.get("/:packageId/users", packageController.getUsersByPackage);

module.exports = router;
