const Notification = require("../models/Notification");
const { getIO } = require("../config/socket");
class NotificationService {
  async createNotification(user, type, title, content) {
    const notification = await Notification.create({
      user,
      type,
      title,
      content,
    });

    try {
      const io = getIO();
      io.to(user.toString()).emit("notification", {
        _id: notification._id,
        type: notification.type,
        title: notification.title,
        content: notification.content,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      });
    } catch (err) {
      console.error("Emit notification error:", err);
    }

    return notification;
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

  async deleteNotification(notificationId) {
    return await Notification.findByIdAndDelete(notificationId);
  }

  async clearNotifications(userId) {
    return await Notification.deleteMany({ user: userId });
  }
}

module.exports = new NotificationService();
