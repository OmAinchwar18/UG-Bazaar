const cartRepository = require('../repositories/cart.repository');
const reviewRepository = require('../repositories/review.repository');
const couponRepository = require('../repositories/coupon.repository');
const settingsRepository = require('../repositories/settings.repository');
const notificationRepository = require('../repositories/notification.repository');
const productRepository = require('../repositories/product.repository');
const orderRepository = require('../repositories/order.repository');
const AppError = require('../utils/appError');

class OtherService {
  // CART
  async getCart(userId) {
    return cartRepository.findOrCreate(userId);
  }

  async addToCart(userId, productId, qty = 1) {
    const product = await productRepository.findById(productId);
    if (!product || !product.isActive || product.stock < qty) {
      throw new AppError('Product is unavailable or out of stock', 400);
    }

    const cart = await cartRepository.findOrCreate(userId);
    const idx = cart.items.findIndex(i => i.product.toString() === productId.toString());

    if (idx > -1) {
      cart.items[idx].qty += qty;
    } else {
      cart.items.push({
        product: productId,
        name: product.name,
        price: product.price,
        qty,
        emoji: product.emoji
      });
    }

    return cartRepository.save(cart);
  }

  async updateCartItem(userId, productId, qty) {
    const cart = await cartRepository.findOrCreate(userId);
    
    if (qty <= 0) {
      cart.items = cart.items.filter(i => i.product.toString() !== productId.toString());
    } else {
      const idx = cart.items.findIndex(i => i.product.toString() === productId.toString());
      if (idx > -1) {
        cart.items[idx].qty = qty;
      } else {
        throw new AppError('Item not found in cart', 404);
      }
    }

    return cartRepository.save(cart);
  }

  async clearCart(userId) {
    return cartRepository.clear(userId);
  }

  // REVIEW
  async getReviews(productId) {
    return reviewRepository.findByProductId(productId);
  }

  async submitReview(userId, reviewData) {
    const { productId, rating, title, text, tags } = reviewData;
    
    const existing = await reviewRepository.findByUserIdAndProductId(userId, productId);
    if (existing) {
      throw new AppError('Pehle review de chuke ho is product par', 400);
    }

    // Verify review if the customer has a delivered order for this product
    const userOrders = await orderRepository.findByUserId(userId);
    const hasBought = userOrders.some(
      order => order.status === 'Delivered' && order.items.some(
        item => item.product._id.toString() === productId.toString()
      )
    );

    const review = await reviewRepository.create({
      user: userId,
      product: productId,
      rating,
      title,
      text,
      tags,
      verified: hasBought
    });

    // Recalculate ratings for this product
    const Product = require('../models/Product');
    const { Review } = require('../models/other.models');
    const stats = await Review.aggregate([
      { $match: { product: review.product } },
      {
        $group: {
          _id: '$product',
          nRating: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        'ratings.average': Math.round(stats[0].avgRating * 10) / 10,
        'ratings.count': stats[0].nRating
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        'ratings.average': 0,
        'ratings.count': 0
      });
    }

    return review;
  }

  // COUPON
  async getCoupons() {
    return couponRepository.findAll();
  }

  async createCoupon(couponData) {
    return couponRepository.create(couponData);
  }

  async deleteCoupon(id) {
    return couponRepository.delete(id);
  }

  async validateCoupon(userId, code, orderTotal) {
    const coupon = await couponRepository.findActiveByCode(code);
    if (!coupon) {
      throw new AppError('Coupon nahi mila ya inactive hai', 404);
    }

    const v = coupon.isValid(orderTotal, userId);
    if (!v.valid) {
      throw new AppError(v.msg, 400);
    }

    const cart = await cartRepository.findOrCreate(userId);
    const discount = coupon.getDiscount(orderTotal, cart);

    return {
      discount,
      message: `Coupon applied successfully! Saved ₹${discount}`
    };
  }

  // SETTINGS
  async getSettings() {
    return settingsRepository.getSettings();
  }

  async updateSettings(settingsData) {
    return settingsRepository.updateSettings(settingsData);
  }

  // NOTIFICATIONS
  async getNotifications(userId) {
    return notificationRepository.findByUserId(userId);
  }

  async markNotificationRead(id) {
    return notificationRepository.markAsRead(id);
  }

  async markAllNotificationsRead(userId) {
    return notificationRepository.markAllAsRead(userId);
  }

  async getAnalyticsSummary() {
    const Order = require('../models/Order');
    const Product = require('../models/Product');
    const User = require('../models/User');

    // 1. Monthly Sales & Revenue (last 6 months)
    const monthlyStats = await Order.aggregate([
      { $match: { status: { $nin: ['Cancelled', 'Returned'] } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          sales: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedMonthly = monthlyStats.map(stat => ({
      name: `${monthNames[stat._id.month]} ${stat._id.year}`,
      sales: stat.sales,
      revenue: stat.revenue
    })).reverse();

    // 2. Top Categories
    const categoryStats = await Order.aggregate([
      { $match: { status: { $nin: ['Cancelled', 'Returned'] } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: '$productDetails.dept',
          value: { $sum: '$items.total' },
          count: { $sum: '$items.qty' }
        }
      },
      { $sort: { value: -1 } }
    ]);

    const formattedCategories = categoryStats.map(c => ({
      name: c._id || 'Unknown',
      value: c.value,
      count: c.count
    }));

    // 3. Best Selling Products
    const bestSellers = await Order.aggregate([
      { $match: { status: { $nin: ['Cancelled', 'Returned'] } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          sales: { $sum: '$items.qty' },
          revenue: { $sum: '$items.total' }
        }
      },
      { $sort: { sales: -1 } },
      { $limit: 5 }
    ]);

    const formattedBestsellers = bestSellers.map(b => ({
      name: b.name || 'Unknown Item',
      sales: b.sales,
      revenue: b.revenue
    }));

    // 4. Summaries
    const [totalProducts, totalOrders, totalUsers, lowStockProducts] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ isActive: true, $expr: { $lte: ['$stock', '$minStockLevel'] } })
    ]);

    const revenueRes = await Order.aggregate([
      { $match: { status: { $nin: ['Cancelled', 'Returned'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueRes[0]?.total || 0;

    return {
      monthlySales: formattedMonthly,
      topCategories: formattedCategories,
      bestSellers: formattedBestsellers,
      summary: {
        totalProducts,
        totalOrders,
        totalRevenue,
        totalCustomers: totalUsers,
        lowStockProducts
      }
    };
  }

  async exportAnalyticsCSV() {
    const data = await this.getAnalyticsSummary();
    let csv = 'UG BAZAAR ANALYTICS SUMMARY REPORT\n';
    csv += `Generated At,${new Date().toLocaleString()}\n\n`;

    csv += 'KEY PERFORMANCE INDICATORS\n';
    csv += `Total Revenue,INR ${data.summary.totalRevenue.toFixed(2)}\n`;
    csv += `Total Orders,${data.summary.totalOrders}\n`;
    csv += `Total Customers,${data.summary.totalCustomers}\n`;
    csv += `Total Products,${data.summary.totalProducts}\n`;
    csv += `Low Stock Products,${data.summary.lowStockProducts}\n\n`;

    csv += 'MONTHLY SALES HISTORY\n';
    csv += 'Month,Sales Count,Revenue (INR)\n';
    data.monthlySales.forEach(m => {
      csv += `"${m.name}",${m.sales},${m.revenue.toFixed(2)}\n`;
    });
    csv += '\n';

    csv += 'TOP CATEGORIES\n';
    csv += 'Category,Revenue (INR),Quantity Sold\n';
    data.topCategories.forEach(c => {
      csv += `"${c.name}",${c.value.toFixed(2)},${c.count}\n`;
    });
    csv += '\n';

    csv += 'BEST SELLING PRODUCTS\n';
    csv += 'Product Name,Units Sold,Revenue (INR)\n';
    data.bestSellers.forEach(b => {
      csv += `"${b.name}",${b.sales},${b.revenue.toFixed(2)}\n`;
    });

    return csv;
  }
}

module.exports = new OtherService();
