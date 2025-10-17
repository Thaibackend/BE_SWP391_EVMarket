const Notification = require("../models/Notification");

class NotificationService {
  async createNotification(user, type, title, content) {
    return await Notification.create({ user, type, title, content });
  }

  async getNotifications(userId) {
    return await Notification.find({ user: userId }).sort({ createdAt: -1 });
  }
}

module.exports = new NotificationService();
