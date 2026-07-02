const { Coupon } = require('../models/other.models');

class CouponRepository {
  async findByCode(code) {
    return Coupon.findOne({ code: code.toUpperCase() });
  }

  async findActiveByCode(code) {
    return Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  }

  async findAll() {
    return Coupon.find().populate('targetProduct').sort({ createdAt: -1 });
  }

  async create(couponData) {
    return Coupon.create(couponData);
  }

  async delete(id) {
    return Coupon.findByIdAndDelete(id);
  }

  async incrementUses(id, userId) {
    return Coupon.findByIdAndUpdate(
      id,
      { 
        $inc: { usedCount: 1 },
        $push: { usedBy: userId }
      },
      { new: true }
    );
  }
}

module.exports = new CouponRepository();
