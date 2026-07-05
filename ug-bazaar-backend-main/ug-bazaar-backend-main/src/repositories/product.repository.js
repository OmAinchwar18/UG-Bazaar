const Product = require('../models/Product');

class ProductRepository {
  async findAll({ dept, badge, inStock, sort, page = 1, limit = 20 }) {
    const filter = { isActive: true };
    if (dept) filter.dept = dept;
    if (badge) filter.badge = badge;
    if (inStock === 'true' || inStock === true) filter.stock = { $gt: 0 };

    const sortMap = {
      'price-low': { price: 1 },
      'price-high': { price: -1 },
      'rating': { 'ratings.average': -1 },
      'newest': { createdAt: -1 }
    };

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortMap[sort] || { createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter)
    ]);

    return { products, total };
  }

  async search(query, dept, limit = 20) {
    const filter = { isActive: true, $text: { $search: query } };
    if (dept) filter.dept = dept;

    let products = await Product.find(filter, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit);

    if (products.length === 0) {
      const regex = new RegExp(query, 'i');
      const fallbackFilter = {
        isActive: true,
        $or: [
          { 'name.en': regex },
          { 'name.hi': regex },
          { 'name.mr': regex },
          { 'description.en': regex },
          { 'description.hi': regex },
          { 'description.mr': regex },
          { 'category.en': regex },
          { 'category.hi': regex },
          { 'category.mr': regex }
        ]
      };
      if (dept) fallbackFilter.dept = dept;
      products = await Product.find(fallbackFilter).limit(limit);
    }

    return products;
  }

  async findById(id) {
    return Product.findById(id);
  }

  async create(productData) {
    return Product.create(productData);
  }

  async update(id, updateData) {
    return Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async softDelete(id) {
    return Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  async updateStock(id, qtyChange) {
    return Product.findByIdAndUpdate(
      id,
      { $inc: { stock: qtyChange } },
      { new: true }
    );
  }

  async getFeaturedProducts(limit = 10) {
    return Product.find({ isActive: true, isFeatured: true }).limit(limit);
  }
}

module.exports = new ProductRepository();
