const express = require('express');
const otherController = require('../controllers/other.controller');
const orderController = require('../controllers/order.controller');
const productController = require('../controllers/product.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// 1. PAYMENT ROUTER
const paymentRouter = express.Router();
paymentRouter.post('/create-order', protect, orderController.createRazorpayOrder);
paymentRouter.post('/verify', protect, orderController.verifyRazorpayPayment);

// 2. CART ROUTER
const cartRouter = express.Router();
cartRouter.get('/', protect, otherController.getCart);
cartRouter.post('/add', protect, otherController.addToCart);
cartRouter.put('/update/:productId', protect, otherController.updateCartItem);
cartRouter.delete('/clear', protect, otherController.clearCart);

// 3. REVIEW ROUTER
const reviewRouter = express.Router();
reviewRouter.get('/:productId', otherController.getReviews);
reviewRouter.post('/', protect, otherController.submitReview);

// 4. COUPON ROUTER
const couponRouter = express.Router();
couponRouter.get('/', otherController.getCoupons);
couponRouter.post('/validate', protect, otherController.validateCoupon);
couponRouter.post('/', protect, adminOnly, otherController.createCoupon);
couponRouter.delete('/:id', protect, adminOnly, otherController.deleteCoupon);

// 5. ADMIN ROUTER
const adminRouter = express.Router();
adminRouter.get('/dashboard', protect, adminOnly, orderController.adminGetDashboard);
adminRouter.get('/customers', protect, adminOnly, otherController.adminGetCustomers);
adminRouter.get('/settings', otherController.getSettings);
adminRouter.put('/settings', protect, adminOnly, otherController.updateSettings);
adminRouter.get('/analytics/summary', protect, adminOnly, otherController.adminGetAnalyticsSummary);
adminRouter.get('/analytics/export', protect, adminOnly, otherController.adminExportAnalyticsReport);
adminRouter.get('/inventory/low-stock', protect, adminOnly, productController.getLowStockProducts);

// 6. NOTIFICATION ROUTER
const notifRouter = express.Router();
notifRouter.get('/', protect, otherController.getNotifications);
notifRouter.put('/:id/read', protect, otherController.markNotificationRead);
notifRouter.put('/mark-all-read', protect, otherController.markAllNotificationsRead);

// 7. CHAT ROUTER
const chatRouter = express.Router();
chatRouter.post('/', otherController.chatbot);

module.exports = {
  paymentRouter,
  cartRouter,
  reviewRouter,
  couponRouter,
  adminRouter,
  notifRouter,
  chatRouter
};
