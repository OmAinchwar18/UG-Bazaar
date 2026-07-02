const { Notification } = require('../models/other.models');

class NotificationRepository {
  async findByUserId(userId, limit = 50) {
    return Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async markAsRead(id) {
    return Notification.findByIdAndUpdate(id, { read: true }, { new: true });
  }

  async markAllAsRead(userId) {
    return Notification.updateMany({ user: userId, read: false }, { read: true });
  }

  async create(notifData) {
    return Notification.create(notifData);
  }
}

module.exports = new NotificationRepository();
