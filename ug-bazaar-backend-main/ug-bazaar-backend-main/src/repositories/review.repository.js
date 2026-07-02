const { Review } = require('../models/other.models');

class ReviewRepository {
  async findByProductId(productId) {
    return Review.find({ product: productId })
      .populate('user', 'name village')
      .sort({ createdAt: -1 });
  }

  async findByUserIdAndProductId(userId, productId) {
    return Review.findOne({ user: userId, product: productId });
  }

  async create(reviewData) {
    return Review.create(reviewData);
  }
}

module.exports = new ReviewRepository();
