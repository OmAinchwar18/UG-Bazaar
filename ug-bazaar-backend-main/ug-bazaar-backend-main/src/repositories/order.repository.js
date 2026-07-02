const Order = require('../models/Order');

class OrderRepository {
  async findById(id) {
    return Order.findById(id)
      .populate('user', 'name mobile email')
      .populate('items.product', 'name price images');
  }

  async findByOrderId(orderId) {
    return Order.findOne({ orderId })
      .populate('user', 'name mobile email')
      .populate('items.product', 'name price images');
  }

  async create(orderData) {
    return Order.create(orderData);
  }

  async findByUserId(userId) {
    return Order.find({ user: userId })
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 });
  }

  async findAll(filters = {}) {
    const page = filters.page ? Number(filters.page) : 1;
    const limit = filters.limit ? Number(filters.limit) : 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.paymentStatus) query['payment.status'] = filters.paymentStatus;
    if (filters.type) query.type = filters.type;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name mobile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query)
    ]);

    return { orders, total };
  }

  async updateStatus(id, status, note = '') {
    const order = await Order.findById(id);
    if (!order) return null;
    order.status = status;
    order.statusHistory.push({ status, note, updatedAt: new Date() });
    return order.save();
  }

  async countOrders() {
    return Order.countDocuments();
  }

  async countTodayOrders(today) {
    return Order.countDocuments({ createdAt: { $gte: today } });
  }

  async getRevenueStats(today) {
    const [todayRev, totalRev] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: today }, status: { $nin: ['Cancelled', 'Returned'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.aggregate([
        { $match: { status: { $nin: ['Cancelled', 'Returned'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
    ]);
    return {
      todayRevenue: todayRev[0]?.total || 0,
      totalRevenue: totalRev[0]?.total || 0
    };
  }
}

module.exports = new OrderRepository();
