const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

router.post("/", notificationController.createNotification);
router.get("/:userId", notificationController.getNotifications);
router.patch("/:notificationId/read", notificationController.markAsRead);
router.patch("/:userId/read-all", notificationController.markAllAsRead);
router.delete("/:notificationId", notificationController.deleteNotification);
router.delete("/user/:userId", notificationController.clearNotifications);
module.exports = router;
