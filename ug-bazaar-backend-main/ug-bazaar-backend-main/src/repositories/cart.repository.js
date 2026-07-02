const { Cart } = require('../models/other.models');

class CartRepository {
  async findByUserId(userId) {
    return Cart.findOne({ user: userId }).populate('items.product', 'name price images stock');
  }

  async findOrCreate(userId) {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }
    return cart;
  }

  async save(cart) {
    return cart.save();
  }

  async clear(userId) {
    return Cart.findOneAndUpdate({ user: userId }, { items: [] }, { new: true });
  }
}

module.exports = new CartRepository();
