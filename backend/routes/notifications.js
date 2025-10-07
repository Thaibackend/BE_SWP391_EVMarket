const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Protected routes
router.get('/', authenticateToken, NotificationController.getUserNotifications);
router.get('/unread-count', authenticateToken, NotificationController.getUnreadCount);
router.put('/:notificationId/read', authenticateToken, NotificationController.markAsRead);
router.put('/mark-all-read', authenticateToken, NotificationController.markAllAsRead);
router.delete('/:notificationId', authenticateToken, NotificationController.deleteNotification);
router.delete('/all', authenticateToken, NotificationController.deleteAllNotifications);

// Admin only routes
router.post('/', authenticateToken, requireAdmin, NotificationController.createNotification);
router.post('/bulk', authenticateToken, requireAdmin, NotificationController.createBulkNotifications);

module.exports = router;
