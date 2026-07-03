const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const invoiceController = require('../controllers/invoice.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.post('/', protect, orderController.placeOrder);
router.get('/my-orders', protect, orderController.getMyOrders);
router.get('/admin/all', protect, adminOnly, orderController.adminGetAllOrders);
router.get('/admin/dashboard', protect, adminOnly, orderController.adminGetDashboard);
router.get('/admin/invoices/all', protect, adminOnly, invoiceController.adminGetAllInvoices);

router.post('/razorpay/create', protect, orderController.createRazorpayOrder);
router.post('/razorpay/verify', protect, orderController.verifyRazorpayPayment);

router.get('/:id/invoice/download', protect, invoiceController.downloadInvoice);
router.get('/:id/invoice/view', protect, invoiceController.viewInvoice);

router.get('/:id', protect, orderController.getOrderById);
router.put('/:id/cancel', protect, orderController.cancelOrder);
router.post('/:id/return', protect, orderController.createReturnRequest);
router.get('/admin/returns/all', protect, adminOnly, orderController.adminGetReturnRequests);
router.put('/admin/returns/:returnId/status', protect, adminOnly, orderController.adminUpdateReturnStatus);
router.put('/admin/:id/status', protect, adminOnly, orderController.adminUpdateStatus);

module.exports = router;
