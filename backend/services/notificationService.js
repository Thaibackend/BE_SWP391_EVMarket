const Notification = require("../models/Notification");

class NotificationService {
  async createNotification(user, type, title, content) {
    return await Notification.create({ user, type, title, content });
  }
}

module.exports = new NotificationService();
