const orderRepository = require('../repositories/order.repository');
const productRepository = require('../repositories/product.repository');
const cartRepository = require('../repositories/cart.repository');
const couponRepository = require('../repositories/coupon.repository');
const settingsRepository = require('../repositories/settings.repository');
const AppError = require('../utils/appError');
const crypto = require('crypto');

class OrderService {
  async placeOrder(userId, orderData) {
    const { items, type, deliveryAddress, paymentMethod, couponCode } = orderData;
    if (!items || items.length === 0) {
      throw new AppError('Order mein items hone zaroori hain', 400);
    }

    const settings = await settingsRepository.getSettings();

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await productRepository.findById(item.product);
      if (!product || !product.isActive) {
        throw new AppError(`Product not available: ${item.name || 'Unknown Item'}`, 400);
      }
      if (product.stock < item.qty) {
        throw new AppError(`Product "${product.name}" out of stock. Stock left: ${product.stock}`, 400);
      }

      const totalItemPrice = product.price * item.qty;
      subtotal += totalItemPrice;
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        qty: item.qty,
        total: totalItemPrice
      });
    }

    let discount = 0;
    let couponSaving = 0;
    if (couponCode) {
      const coupon = await couponRepository.findByCode(couponCode);
      if (coupon) {
        const cart = await cartRepository.findByUserId(userId);
        const v = coupon.isValid(subtotal, userId);
        if (v.valid) {
          discount = coupon.getDiscount(subtotal, cart);
          couponSaving = discount;
          await couponRepository.incrementUses(coupon._id, userId);
        }
      }
    }

    let deliveryCharge = 0;
    if (type === 'delivery') {
      deliveryCharge = subtotal >= settings.minFreeDelivery ? 0 : settings.deliveryCharge;
    }

    const total = Math.max(0, subtotal - discount + deliveryCharge);

    const order = await orderRepository.create({
      user: userId,
      items: orderItems,
      subtotal,
      discount,
      couponCode,
      couponSaving,
      deliveryCharge,
      total,
      type,
      deliveryAddress,
      payment: {
        method: paymentMethod,
        status: paymentMethod === 'cod' ? 'pending' : 'pending'
      },
      statusHistory: [{ status: 'Placed', note: 'Order placed by user' }]
    });

    const productService = require('./product.service');
    for (const item of orderItems) {
      await productService.adjustStock(
        item.product,
        -item.qty,
        'order_placed',
        `Order #${order.orderId} placed`,
        userId
      );
    }

    await cartRepository.clear(userId);

    // Generate Invoice immediately after successful order placement
    const invoiceService = require('./invoice.service');
    invoiceService.generateInvoice(order._id).catch(err => {
      console.error("Error generating invoice on order placement:", err);
    });

    // Emit new_order event via Socket.io
    const { getIO } = require('../sockets/socket.handler');
    const io = getIO();
    if (io) {
      io.emit('new_order', {
        orderId: order.orderId,
        total: order.total,
        userName: order.deliveryAddress.name,
        createdAt: order.createdAt
      });
    }

    // Queue background jobs for order receipt and SMS updates
    const { getQueue } = require('../config/queue.config');
    const userRepository = require('../repositories/user.repository');
    
    getQueue('notificationQueue').add('sendOrderStatusUpdate', {
      mobile: order.deliveryAddress.mobile,
      orderId: order.orderId,
      status: order.status
    }).catch(() => {});

    userRepository.findById(userId).then(usr => {
      if (usr && usr.email) {
        getQueue('emailQueue').add('sendOrderReceipt', {
          email: usr.email,
          orderId: order.orderId,
          total: order.total
        }).catch(() => {});
      }
    }).catch(() => {});

    return order;
  }

  async getMyOrders(userId) {
    return orderRepository.findByUserId(userId);
  }

  async getOrderById(id) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    return order;
  }

  async cancelOrder(id, userId) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.user._id.toString() !== userId.toString()) {
      throw new AppError('Unauthorized to cancel this order', 403);
    }

    if (['Shipped', 'Out For Delivery', 'Delivered', 'Cancelled', 'Returned'].includes(order.status)) {
      throw new AppError(`Cannot cancel order in state: ${order.status}`, 400);
    }

    const productService = require('./product.service');
    for (const item of order.items) {
      await productService.adjustStock(
        item.product,
        item.qty,
        'order_cancelled',
        `Order #${order.orderId} cancelled by customer`,
        userId
      );
    }

    return orderRepository.updateStatus(id, 'Cancelled', 'Order cancelled by customer');
  }

  async adminGetAllOrders(filters) {
    return orderRepository.findAll(filters);
  }

  async adminUpdateStatus(id, status, note, adminId) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      const productService = require('./product.service');
      for (const item of order.items) {
        await productService.adjustStock(
          item.product,
          item.qty,
          'order_cancelled',
          `Order #${order.orderId} cancelled by admin`,
          adminId
        );
      }
    } else if (status === 'Returned' && order.status !== 'Returned') {
      const productService = require('./product.service');
      for (const item of order.items) {
        await productService.adjustStock(
          item.product,
          item.qty,
          'order_returned',
          `Order #${order.orderId} returned`,
          adminId
        );
      }
    }

    const updated = await orderRepository.updateStatus(id, status, note);

    // Queue status update alerts & trigger live WebSockets broadcast
    const { getQueue } = require('../config/queue.config');
    getQueue('notificationQueue').add('sendOrderStatusUpdate', {
      mobile: order.deliveryAddress.mobile,
      orderId: order.orderId,
      status
    }).catch(() => {});

    const { emitOrderStatusChange } = require('../sockets/socket.handler');
    emitOrderStatusChange(order.user._id || order.user, order.orderId, status, note || `Order state updated to: ${status}`);

    return updated;
  }

  async getAdminDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const User = require('../models/User');
    const Product = require('../models/Product');

    const [totalOrders, todayOrders, revenueStats, totalUsers, totalProducts] = await Promise.all([
      orderRepository.countOrders(),
      orderRepository.countTodayOrders(today),
      orderRepository.getRevenueStats(today),
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ isActive: true })
    ]);

    return {
      totalOrders,
      todayOrders,
      totalUsers,
      totalProducts,
      ...revenueStats
    };
  }

  async createRazorpayOrder(amount, orderId) {
    const razorpay = require('../config/razorpay');
    try {
      const o = await razorpay.orders.create({
        amount: Math.round(amount * 100), // in paise
        currency: 'INR',
        receipt: orderId
      });
      return {
        id: o.id,
        amount: o.amount,
        currency: o.currency,
        key: process.env.RAZORPAY_KEY_ID
      };
    } catch (err) {
      throw new AppError(`Razorpay order creation failed: ${err.message}`, 500);
    }
  }

  async verifyRazorpayPayment(verificationData) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = verificationData;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (expected !== razorpay_signature) {
      throw new AppError('Razorpay Payment verification failed', 400);
    }

    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    order.payment.status = 'paid';
    order.payment.razorpayOrderId = razorpay_order_id;
    order.payment.razorpayPaymentId = razorpay_payment_id;
    order.payment.paidAt = new Date();
    await order.save();

    // Regenerate/update invoice with PAID status
    const invoiceService = require('./invoice.service');
    invoiceService.generateInvoice(order._id).catch(err => {
      console.error("Error regenerating invoice on Razorpay payment verification:", err);
    });

    // Emit payment verification success via sockets
    const { getIO } = require('../sockets/socket.handler');
    const io = getIO();
    if (io) {
      io.to(`user_${order.user._id || order.user}`).emit('payment_success', {
        orderId: order.orderId,
        total: order.total
      });
      io.emit('admin_payment_success', {
        orderId: order.orderId,
        total: order.total,
        userName: order.deliveryAddress?.name || 'Customer'
      });
    }

    return order;
  }
}

module.exports = new OrderService();
