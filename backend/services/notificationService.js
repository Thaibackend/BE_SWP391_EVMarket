const Notification = require("../models/Notification");

class NotificationService {
  async createNotification(user, type, title, content) {
    return await Notification.create({ user, type, title, content });
  }

  async getNotifications(userId) {
    return await Notification.find({ user: userId }).sort({ createdAt: -1 });
  }

  async markAsRead(notificationId) {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
  }

  async markAllAsRead(userId) {
    return await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );
  }
}

module.exports = new NotificationService();
