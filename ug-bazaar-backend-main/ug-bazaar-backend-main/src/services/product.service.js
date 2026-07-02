const productRepository = require('../repositories/product.repository');
const AppError = require('../utils/appError');

class ProductService {
  async getProducts(filters) {
    return productRepository.findAll(filters);
  }

  async searchProducts(query, dept) {
    if (!query) {
      throw new AppError('Search query is required', 400);
    }
    return productRepository.search(query, dept);
  }

  async getProductById(id) {
    const product = await productRepository.findById(id);
    if (!product || !product.isActive) {
      throw new AppError('Product not found or has been disabled', 404);
    }
    return product;
  }

  async createProduct(productData) {
    return productRepository.create(productData);
  }

  async updateProduct(id, updateData) {
    const product = await productRepository.update(id, updateData);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }

  async deleteProduct(id) {
    const product = await productRepository.softDelete(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }

  async getRecommendations(productId, limit = 5) {
    let recommendations = [];
    if (productId) {
      const product = await productRepository.findById(productId);
      if (product) {
        const siblings = await productRepository.findAll({
          dept: product.dept,
          limit: limit + 1
        });
        recommendations = siblings.products.filter(
          p => p._id.toString() !== productId
        );
      }
    }

    if (recommendations.length < limit) {
      const featured = await productRepository.findAll({
        badge: 'Popular',
        limit: limit - recommendations.length
      });
      recommendations = [...recommendations, ...featured.products];
    }

    // Deduplicate recommendations
    const seen = new Set();
    const uniqueRecs = [];
    for (const rec of recommendations) {
      if (!seen.has(rec._id.toString())) {
        seen.add(rec._id.toString());
        uniqueRecs.push(rec);
      }
    }

    return uniqueRecs.slice(0, limit);
  }

  async adjustStock(productId, qtyChange, type, note, userId) {
    const Product = require('../models/Product');
    const InventoryLog = require('../models/InventoryLog');
    const { getIO } = require('../sockets/socket.handler');

    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const newStock = product.stock + qtyChange;
    if (newStock < 0) {
      throw new AppError('Cannot decrease stock below 0', 400);
    }

    product.stock = newStock;
    await product.save();

    // Create audit log
    const log = await InventoryLog.create({
      product: productId,
      quantityChange: qtyChange,
      resultingStock: newStock,
      type: type || 'stock_adjusted',
      note: note || 'Manual stock adjustment',
      user: userId
    });

    // Check for low stock alert
    if (newStock <= product.minStockLevel) {
      const io = getIO();
      if (io) {
        io.emit('low_stock_alert', {
          productId: product._id,
          name: product.name,
          stock: newStock,
          minStockLevel: product.minStockLevel
        });
      }
    }

    return { product, log };
  }

  async getInventoryLogs(productId) {
    const InventoryLog = require('../models/InventoryLog');
    return InventoryLog.find({ product: productId })
      .populate('user', 'name role')
      .sort({ createdAt: -1 });
  }

  async getLowStockProducts() {
    const Product = require('../models/Product');
    // Find all products where stock is less than or equal to minimum stock level
    return Product.find({
      isActive: true,
      $expr: { $lte: ['$stock', '$minStockLevel'] }
    });
  }
}

module.exports = new ProductService();
