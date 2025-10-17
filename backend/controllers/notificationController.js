const notificationService = require("../services/notificationService");

exports.createNotification = async (req, res) => {
  try {
    const { user, type, title, content } = req.body;
    const notification = await notificationService.createNotification(
      user,
      type,
      title,
      content
    );
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await notificationService.getNotifications(userId);
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
