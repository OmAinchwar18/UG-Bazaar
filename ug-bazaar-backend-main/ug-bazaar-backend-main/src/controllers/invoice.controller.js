const invoiceService = require('../services/invoice.service');
const Order = require('../models/Order');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const path = require('path');
const fs = require('fs');

exports.downloadInvoice = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Authorization Check: Only order buyer or admin can download invoice
  if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
    return next(new AppError('Forbidden: You are not authorized to access this invoice', 403));
  }

  // Generate or retrieve invoice
  const invoice = await invoiceService.generateInvoice(order._id);
  const fullPath = path.join(__dirname, '..', '..', 'public', invoice.pdfPath);

  // If PDF file is missing on disk, regenerate it
  if (!fs.existsSync(fullPath)) {
    await invoiceService.generateInvoice(order._id);
  }

  res.download(fullPath, `invoice-${order.orderId.replace('#', '')}.pdf`);
});

exports.viewInvoice = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Authorization Check
  if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
    return next(new AppError('Forbidden: You are not authorized to access this invoice', 403));
  }

  // Generate or retrieve invoice
  const invoice = await invoiceService.generateInvoice(order._id);
  const fullPath = path.join(__dirname, '..', '..', 'public', invoice.pdfPath);

  if (!fs.existsSync(fullPath)) {
    await invoiceService.generateInvoice(order._id);
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="invoice-${order.orderId.replace('#', '')}.pdf"`);
  
  const stream = fs.createReadStream(fullPath);
  stream.on('error', (err) => next(new AppError(`Error reading PDF file: ${err.message}`, 500)));
  stream.pipe(res);
});

exports.adminGetAllInvoices = catchAsync(async (req, res, next) => {
  const Invoice = require('../models/Invoice');
  const invoices = await Invoice.find()
    .populate('order', 'orderId createdAt total status')
    .populate('user', 'name mobile')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: invoices.length,
    invoices
  });
});
