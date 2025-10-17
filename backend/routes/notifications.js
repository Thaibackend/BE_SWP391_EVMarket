const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");

router.post("/", notificationController.createNotification);
router.get("/:userId", notificationController.getNotifications);
router.patch("/:notificationId/read", notificationController.markAsRead);
router.patch("/:userId/read-all", notificationController.markAllAsRead);
module.exports = router;
