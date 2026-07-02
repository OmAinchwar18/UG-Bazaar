const Invoice = require('../models/Invoice');
const Order = require('../models/Order');
const pdfService = require('./pdf.service');
const path = require('path');
const fs = require('fs');

class InvoiceService {
  /**
   * Generates or updates an invoice for a given order ID
   * @param {String} orderId MongoDB ObjectId of the Order
   */
  async generateInvoice(orderId) {
    const order = await Order.findById(orderId).populate('user');
    if (!order) {
      throw new Error('Order not found for invoice generation');
    }

    // Check if invoice already exists
    let invoice = await Invoice.findOne({ order: orderId });
    const currentYear = new Date().getFullYear();

    if (!invoice) {
      // Create new invoice number sequence
      const count = await Invoice.countDocuments();
      const invoiceNo = `INV/${currentYear}/${String(10001 + count).padStart(5, '0')}`;

      // GST Calculation (18% inclusive)
      const totalGstVal = order.subtotal - (order.subtotal / 1.18);
      const cgst = totalGstVal / 2;
      const sgst = totalGstVal / 2;

      // Define local A4 PDF output path
      const relativePdfPath = `/uploads/invoices/invoice-${order.orderId.replace('#', '')}.pdf`;
      const fullPdfPath = path.join(__dirname, '..', '..', 'public', relativePdfPath);

      invoice = new Invoice({
        invoiceNo,
        order: order._id,
        user: order.user._id,
        pdfPath: relativePdfPath, // store path in DB
        subtotal: order.subtotal,
        discount: order.discount,
        deliveryCharge: order.deliveryCharge,
        cgst,
        sgst,
        grandTotal: order.total
      });

      // Generate actual A4 PDF
      await pdfService.generateInvoicePdf(order, invoice, fullPdfPath);
      await invoice.save();
    } else {
      // If invoice exists, regenerate PDF (e.g. status or payment changed)
      const fullPdfPath = path.join(__dirname, '..', '..', 'public', invoice.pdfPath);
      await pdfService.generateInvoicePdf(order, invoice, fullPdfPath);
    }

    return invoice;
  }

  /**
   * Retrieves the invoice record by Order ID
   * @param {String} orderId MongoDB ObjectId of the Order
   */
  async getInvoiceByOrderId(orderId) {
    return Invoice.findOne({ order: orderId });
  }
}

module.exports = new InvoiceService();
