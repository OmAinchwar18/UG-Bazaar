const User = require('../models/User');

class UserRepository {
  async findById(id) {
    return User.findById(id);
  }

  async findByMobile(mobile) {
    return User.findOne({ mobile });
  }

  async findByMobileOrNameWithPassword(identifier) {
    return User.findOne({
      $or: [
        { mobile: identifier },
        { name: { $regex: new RegExp(`^${identifier.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } }
      ]
    }).select('+password');
  }

  async create(userData) {
    return User.create(userData);
  }

  async update(id, updateData) {
    return User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async findAllCustomers() {
    return User.find({ role: 'user' }).sort({ createdAt: -1 });
  }
}

module.exports = new UserRepository();
