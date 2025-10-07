const Notification = require('../models/Notification');
const { authenticateToken } = require('../middleware/auth');

class NotificationController {
    // Get user notifications (Protected)
    static async getUserNotifications(req, res) {
        try {
            const { page = 1, limit = 10, unreadOnly = false } = req.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const userId = req.user.userId;

            const notifications = await Notification.getByUserId(userId, pageNum, limitNum, unreadOnly === 'true');

            res.json({
                success: true,
                data: {
                    notifications,
                    pagination: {
                        currentPage: pageNum,
                        totalPages: Math.ceil(notifications.length / limitNum),
                        totalItems: notifications.length,
                        itemsPerPage: limitNum
                    }
                }
            });
        } catch (error) {
            console.error('Get user notifications error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get notifications',
                error: error.message
            });
        }
    }

    // Get unread notification count (Protected)
    static async getUnreadCount(req, res) {
        try {
            const userId = req.user.userId;
            const unreadCount = await Notification.getUnreadCount(userId);

            res.json({
                success: true,
                data: { unreadCount }
            });
        } catch (error) {
            console.error('Get unread count error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get unread count',
                error: error.message
            });
        }
    }

    // Mark notification as read (Protected)
    static async markAsRead(req, res) {
        try {
            const { notificationId } = req.params;
            const userId = req.user.userId;

            // Verify notification belongs to user
            const userNotifications = await Notification.getByUserId(userId);
            const targetNotification = userNotifications.find(n => n.notificationId === parseInt(notificationId));

            if (!targetNotification) {
                return res.status(404).json({
                    success: false,
                    message: 'Notification not found or you do not have permission to read it'
                });
            }

            const updatedNotification = await Notification.markAsRead(parseInt(notificationId));

            res.json({
                success: true,
                message: 'Notification marked as read',
                data: updatedNotification
            });
        } catch (error) {
            console.error('Mark notification as read error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to mark notification as read',
                error: error.message
            });
        }
    }

    // Mark all notifications as read (Protected)
    static async markAllAsRead(req, res) {
        try {
            const userId = req.user.userId;
            const updatedCount = await Notification.markAllAsRead(userId);

            res.json({
                success: true,
                message: 'All notifications marked as read',
                data: { updatedCount }
            });
        } catch (error) {
            console.error('Mark all notifications as read error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to mark all notifications as read',
                error: error.message
            });
        }
    }

    // Delete notification (Protected)
    static async deleteNotification(req, res) {
        try {
            const { notificationId } = req.params;
            const userId = req.user.userId;

            // Verify notification belongs to user
            const userNotifications = await Notification.getByUserId(userId);
            const targetNotification = userNotifications.find(n => n.notificationId === parseInt(notificationId));

            if (!targetNotification) {
                return res.status(404).json({
                    success: false,
                    message: 'Notification not found or you do not have permission to delete it'
                });
            }

            const deleted = await Notification.delete(parseInt(notificationId));

            if (deleted) {
                res.json({
                    success: true,
                    message: 'Notification deleted successfully'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to delete notification'
                });
            }
        } catch (error) {
            console.error('Delete notification error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete notification',
                error: error.message
            });
        }
    }

    // Delete all notifications (Protected)
    static async deleteAllNotifications(req, res) {
        try {
            const userId = req.user.userId;
            const deletedCount = await Notification.deleteAll(userId);

            res.json({
                success: true,
                message: 'All notifications deleted successfully',
                data: { deletedCount }
            });
        } catch (error) {
            console.error('Delete all notifications error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete all notifications',
                error: error.message
            });
        }
    }

    // Create notification (Admin only)
    static async createNotification(req, res) {
        try {
            const { userId, content } = req.body;

            const notificationData = {
                userId: parseInt(userId),
                content
            };

            const notification = await Notification.create(notificationData);

            res.status(201).json({
                success: true,
                message: 'Notification created successfully',
                data: notification
            });
        } catch (error) {
            console.error('Create notification error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create notification',
                error: error.message
            });
        }
    }

    // Create bulk notifications (Admin only)
    static async createBulkNotifications(req, res) {
        try {
            const { notifications } = req.body;

            if (!Array.isArray(notifications) || notifications.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Notifications array is required'
                });
            }

            const createdCount = await Notification.createBulk(notifications);

            res.status(201).json({
                success: true,
                message: 'Bulk notifications created successfully',
                data: { createdCount }
            });
        } catch (error) {
            console.error('Create bulk notifications error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create bulk notifications',
                error: error.message
            });
        }
    }
}

module.exports = NotificationController;
