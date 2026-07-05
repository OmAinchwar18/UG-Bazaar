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

  async cancelOrder(id, userId, reason = 'Ordered by mistake', comments = '') {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.user._id.toString() !== userId.toString() && order.user.role !== 'admin') {
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

    const finalNote = reason + (comments ? `: ${comments}` : '');
    order.status = 'Cancelled';
    order.cancellationReason = finalNote;
    order.cancelledAt = new Date();
    order.statusHistory.push({ status: 'Cancelled', note: finalNote, updatedAt: new Date() });
    
    if (!order.orderTimeline) order.orderTimeline = [];
    order.orderTimeline.push({ status: 'Cancelled', note: finalNote, updatedAt: new Date() });

    if (order.payment && order.payment.status === 'paid') {
      order.payment.status = 'refunded';
      order.refundStatus = 'Completed';
      order.refundAmount = order.total;
      order.refundDate = new Date();
    }

    const saved = await order.save();

    // Sockets update
    const { getIO, emitOrderStatusChange } = require('../sockets/socket.handler');
    emitOrderStatusChange(order.user._id || order.user, order.orderId, 'Cancelled', finalNote);
    
    const io = getIO();
    if (io) {
      io.emit('admin_new_cancellation', {
        orderId: order.orderId,
        reason: finalNote,
        createdAt: new Date()
      });
    }

    // Customer Notification
    const notificationRepository = require('../repositories/notification.repository');
    await notificationRepository.create({
      user: order.user._id || order.user,
      type: 'order',
      title: 'Order Cancelled Successfully',
      body: `Aapka order ${order.orderId} cancel ho gaya hai.`,
      icon: '❌',
      link: `/order-detail?id=${order._id}`
    });

    return saved;
  }

  async createReturnRequest(id, userId, returnData) {
    const { reason, comments, images, products } = returnData;
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.user._id.toString() !== userId.toString()) {
      throw new AppError('Unauthorized to return this order', 403);
    }

    if (order.status !== 'Delivered') {
      throw new AppError('Only delivered orders can be returned', 400);
    }

    const deliveredEvent = order.statusHistory.find(h => h.status === 'Delivered');
    const deliveredAt = deliveredEvent ? new Date(deliveredEvent.updatedAt) : new Date(order.updatedAt);
    const timeDiff = new Date().getTime() - deliveredAt.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    if (daysDiff > 7) {
      throw new AppError('Returns are only allowed within 7 days of delivery', 400);
    }

    const ReturnRequest = require('../models/ReturnRequest');
    const productIds = (products && products.length > 0) 
      ? products 
      : order.items.map(item => item.product ? (item.product._id || item.product) : null).filter(Boolean);

    const returnRequest = await ReturnRequest.create({
      order: order._id,
      customer: userId,
      products: productIds,
      reason,
      images: images || [],
      comments: comments || '',
      status: 'Return Requested'
    });

    order.status = 'Return Requested';
    order.returnRequest = returnRequest._id;
    order.returnStatus = 'Return Requested';
    order.refundStatus = 'Pending';
    order.refundAmount = order.total;

    const finalNote = `Return requested: ${reason}` + (comments ? ` (${comments})` : '');
    order.statusHistory.push({ status: 'Return Requested', note: finalNote, updatedAt: new Date() });
    
    if (!order.orderTimeline) order.orderTimeline = [];
    order.orderTimeline.push({ status: 'Return Requested', note: finalNote, updatedAt: new Date() });
    
    await order.save();

    const { getIO, emitOrderStatusChange } = require('../sockets/socket.handler');
    emitOrderStatusChange(order.user._id || order.user, order.orderId, 'Return Requested', finalNote);
    
    const io = getIO();
    if (io) {
      io.emit('admin_new_return_request', {
        orderId: order.orderId,
        reason: finalNote,
        createdAt: returnRequest.createdAt
      });
    }

    const notificationRepository = require('../repositories/notification.repository');
    await notificationRepository.create({
      user: userId,
      type: 'order',
      title: 'Return Request Submitted',
      body: `Aapke order ${order.orderId} ke return request ko accept kar liya gaya hai aur review kiya ja raha hai.`,
      icon: '🔄',
      link: `/order-detail?id=${order._id}`
    });

    return returnRequest;
  }

  async adminGetReturnRequests() {
    const ReturnRequest = require('../models/ReturnRequest');
    return ReturnRequest.find()
      .populate('order', 'orderId total status items')
      .populate('customer', 'name mobile')
      .populate('products', 'name price images')
      .sort({ createdAt: -1 });
  }

  async adminUpdateReturnStatus(returnId, updateData) {
    const { status, adminNotes, refundAmount, refundTransactionId, refundMethod, refundDate, adminId } = updateData;
    const ReturnRequest = require('../models/ReturnRequest');
    const returnRequest = await ReturnRequest.findById(returnId)
      .populate('order')
      .populate('customer');
    if (!returnRequest) {
      throw new AppError('Return request not found', 404);
    }

    const order = returnRequest.order;
    if (!order) {
      throw new AppError('Order associated with this return request not found', 404);
    }

    returnRequest.status = status;
    if (adminNotes !== undefined) returnRequest.adminNotes = adminNotes;
    
    order.returnStatus = status;

    const finalNote = adminNotes || `Return status changed to: ${status}`;
    order.statusHistory.push({ status: `Return ${status}`, note: finalNote, updatedAt: new Date() });
    
    if (!order.orderTimeline) order.orderTimeline = [];
    order.orderTimeline.push({ status: `Return ${status}`, note: finalNote, updatedAt: new Date() });

    if (status === 'Approved') {
      order.status = 'Approved';
      returnRequest.status = 'Approved';
    } else if (status === 'Rejected') {
      order.status = 'Delivered';
      order.returnStatus = 'Rejected';
      returnRequest.status = 'Rejected';
    } else if (status === 'Product Received') {
      const productService = require('./product.service');
      for (const item of order.items) {
        if (returnRequest.products.some(pId => pId.toString() === item.product.toString())) {
          await productService.adjustStock(
            item.product,
            item.qty,
            'order_returned',
            `Returned items from Order #${order.orderId} received`,
            adminId
          );
        }
      }
    } else if (status === 'Refund Completed') {
      returnRequest.status = 'Refund Completed';
      returnRequest.refundAmount = refundAmount || order.total;
      returnRequest.refundTransactionId = refundTransactionId || '';
      returnRequest.refundMethod = refundMethod || 'upi';

      order.status = 'Refund Completed';
      order.returnStatus = 'Refund Completed';
      order.refundStatus = 'Completed';
      order.refundAmount = refundAmount || order.total;
      order.refundDate = refundDate ? new Date(refundDate) : new Date();
      order.refundTransactionId = refundTransactionId || '';
      order.refundMethod = refundMethod || 'upi';
    } else if (status === 'Refund Initiated') {
      order.refundStatus = 'Processing';
    }

    await returnRequest.save();
    await order.save();

    const { emitOrderStatusChange } = require('../sockets/socket.handler');
    emitOrderStatusChange(order.user._id || order.user, order.status, order.status, finalNote);

    const notificationRepository = require('../repositories/notification.repository');
    let title = 'Return Status Update';
    let body = `Aapke order ${order.orderId} ke return status ko change kar ke "${status}" kar diya gaya hai.`;
    let icon = '🔄';

    if (status === 'Approved') {
      title = 'Return Request Approved';
      body = `Aapke order ${order.orderId} ka return request approve ho gaya hai. Pickup schedule kiya ja raha hai.`;
      icon = '✅';
    } else if (status === 'Rejected') {
      title = 'Return Request Rejected';
      body = `Aapke order ${order.orderId} ka return request reject ho gaya hai. Note: ${adminNotes || 'N/A'}`;
      icon = '❌';
    } else if (status === 'Refund Initiated') {
      title = 'Refund Initiated';
      body = `Aapke order ${order.orderId} ka refund process shuru ho gaya hai.`;
      icon = '💰';
    } else if (status === 'Refund Completed') {
      title = 'Refund Completed';
      body = `Aapke order ${order.orderId} ka refund amount ₹${refundAmount || order.total} complete ho gaya hai. TXN ID: ${refundTransactionId || 'N/A'}`;
      icon = '🎉';
    }

    await notificationRepository.create({
      user: order.user._id || order.user,
      type: 'order',
      title,
      body,
      icon,
      link: `/order-detail?id=${order._id}`
    });

    return returnRequest;
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
    const ReturnRequest = require('../models/ReturnRequest');
    const Order = require('../models/Order');

    const [
      totalOrders, 
      todayOrders, 
      revenueStats, 
      totalUsers, 
      totalProducts,
      totalReturns,
      pendingReturns,
      approvedReturns,
      cancelledOrders,
      refundsCompleted
    ] = await Promise.all([
      orderRepository.countOrders(),
      orderRepository.countTodayOrders(today),
      orderRepository.getRevenueStats(today),
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ isActive: true }),
      ReturnRequest.countDocuments(),
      ReturnRequest.countDocuments({ status: { $in: ['Return Requested', 'Under Review'] } }),
      ReturnRequest.countDocuments({ status: 'Approved' }),
      Order.countDocuments({ status: 'Cancelled' }),
      ReturnRequest.countDocuments({ status: 'Refund Completed' })
    ]);

    return {
      totalOrders,
      todayOrders,
      totalUsers,
      totalProducts,
      totalReturns,
      pendingReturns,
      approvedReturns,
      cancelledOrders,
      refundsCompleted,
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
