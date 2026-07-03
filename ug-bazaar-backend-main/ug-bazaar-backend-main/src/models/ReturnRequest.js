const mongoose = require('mongoose');

const returnRequestSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  reason: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  comments: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: [
      'Return Requested',
      'Under Review',
      'Approved',
      'Rejected',
      'Pickup Scheduled',
      'Product Received',
      'Refund Initiated',
      'Refund Completed'
    ],
    default: 'Return Requested'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundTransactionId: {
    type: String,
    default: ''
  },
  refundMethod: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('ReturnRequest', returnRequestSchema);
