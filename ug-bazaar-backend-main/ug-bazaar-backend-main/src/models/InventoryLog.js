const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantityChange: {
    type: Number,
    required: true
  },
  resultingStock: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['stock_adjusted', 'order_placed', 'order_cancelled', 'order_returned', 'audit'],
    required: true
  },
  note: {
    type: String,
    default: ''
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // can be null for automated/anonymous events
  }
}, { timestamps: true });

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);
