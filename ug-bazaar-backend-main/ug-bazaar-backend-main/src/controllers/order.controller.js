const orderService = require('../services/order.service');
const catchAsync = require('../utils/catchAsync');

exports.placeOrder = catchAsync(async (req, res, next) => {
  const order = await orderService.placeOrder(req.user._id, req.body);
  res.status(201).json({
    success: true,
    order
  });
});

exports.getMyOrders = catchAsync(async (req, res, next) => {
  const orders = await orderService.getMyOrders(req.user._id);
  res.status(200).json({
    success: true,
    orders
  });
});

exports.getOrderById = catchAsync(async (req, res, next) => {
  const order = await orderService.getOrderById(req.params.id);
  
  if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Forbidden: You do not have access to view this order.' });
  }

  res.status(200).json({
    success: true,
    order
  });
});

exports.cancelOrder = catchAsync(async (req, res, next) => {
  const order = await orderService.cancelOrder(req.params.id, req.user._id);
  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    order
  });
});

exports.adminGetAllOrders = catchAsync(async (req, res, next) => {
  const result = await orderService.adminGetAllOrders(req.query);
  res.status(200).json({
    success: true,
    total: result.total,
    orders: result.orders
  });
});

exports.adminUpdateStatus = catchAsync(async (req, res, next) => {
  const { status, note } = req.body;
  const order = await orderService.adminUpdateStatus(req.params.id, status, note, req.user._id);
  res.status(200).json({
    success: true,
    message: `Order status updated to ${status}`,
    order
  });
});

exports.adminGetDashboard = catchAsync(async (req, res, next) => {
  const stats = await orderService.getAdminDashboardStats();
  res.status(200).json({
    success: true,
    stats
  });
});

exports.createRazorpayOrder = catchAsync(async (req, res, next) => {
  const { amount, orderId } = req.body;
  const razorpayOrder = await orderService.createRazorpayOrder(amount, orderId);
  res.status(200).json({
    success: true,
    ...razorpayOrder
  });
});

exports.verifyRazorpayPayment = catchAsync(async (req, res, next) => {
  const order = await orderService.verifyRazorpayPayment(req.body);
  res.status(200).json({
    success: true,
    message: 'Payment verified successfully',
    order
  });
});
