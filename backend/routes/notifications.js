const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get user notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User notifications
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateToken, NotificationController.getUserNotifications);

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     tags: [Notifications]
 *     summary: Get unread notification count
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count
 *       401:
 *         description: Unauthorized
 */
router.get('/unread-count', authenticateToken, NotificationController.getUnreadCount);

/**
 * @swagger
 * /api/notifications/{notificationId}/read:
 *   put:
 *     tags: [Notifications]
 *     summary: Mark notification as read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         description: Unauthorized
 */
router.put('/:notificationId/read', authenticateToken, NotificationController.markAsRead);

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   put:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         description: Unauthorized
 */
router.put('/mark-all-read', authenticateToken, NotificationController.markAllAsRead);

/**
 * @swagger
 * /api/notifications/{notificationId}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete notification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notification deleted
 *       401:
 *         description: Unauthorized
 */
router.delete('/:notificationId', authenticateToken, NotificationController.deleteNotification);

/**
 * @swagger
 * /api/notifications/all:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete all notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications deleted
 *       401:
 *         description: Unauthorized
 */
router.delete('/all', authenticateToken, NotificationController.deleteAllNotifications);

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     tags: [Notifications]
 *     summary: Create notification (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - content
 *             properties:
 *               userId:
 *                 type: integer
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notification created
 *       403:
 *         description: Admin access required
 */
router.post('/', authenticateToken, requireAdmin, NotificationController.createNotification);

/**
 * @swagger
 * /api/notifications/bulk:
 *   post:
 *     tags: [Notifications]
 *     summary: Create bulk notifications (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetType
 *               - content
 *             properties:
 *               targetType:
 *                 type: string
 *                 enum: [All, Buyers, Sellers, Specific]
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Bulk notifications created
 *       403:
 *         description: Admin access required
 */
router.post('/bulk', authenticateToken, requireAdmin, NotificationController.createBulkNotifications);

module.exports = router;
