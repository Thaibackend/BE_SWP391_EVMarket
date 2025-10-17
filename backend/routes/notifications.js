const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");

router.post("/", notificationController.createNotification);
router.get("/:userId", notificationController.getNotifications);
module.exports = router;
