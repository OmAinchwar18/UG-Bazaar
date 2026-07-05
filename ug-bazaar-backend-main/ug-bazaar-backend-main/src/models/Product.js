const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true, trim: true },
    hi: { type: String, trim: true },
    mr: { type: String, trim: true }
  },
  brand: String,
  description: {
    en: { type: String, trim: true },
    hi: { type: String, trim: true },
    mr: { type: String, trim: true }
  },
  dept: { type: String, required: true, enum: ['Grocery', 'Agriculture', 'Building Materials', 'Hardware Tools', 'Plumbing', 'Electrical', 'Furniture', 'Home Appliances', 'Electronics', 'General Store', 'Mobiles', 'Fashion', 'Beauty', 'Home & Kitchen', 'Hardware'] },
  category: {
    en: { type: String, trim: true },
    hi: { type: String, trim: true },
    mr: { type: String, trim: true }
  },
  specifications: [
    {
      key: {
        en: { type: String, required: true },
        hi: String,
        mr: String
      },
      value: {
        en: { type: String, required: true },
        hi: String,
        mr: String
      }
    }
  ],
  features: [
    {
      en: { type: String, required: true },
      hi: String,
      mr: String
    }
  ],
  price: { type: Number, required: true }, mrp: { type: Number, required: true }, cost: Number,
  purchasePrice: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  minStockLevel: { type: Number, default: 5 },
  sku: { type: String, unique: true, sparse: true },
  supplierName: { type: String, default: 'Local Supplier' },
  images: [
    {
      url: { type: String, required: true },
      isPrimary: { type: Boolean, default: false }
    }
  ],
  badge: { type: String, enum: ['Popular','Hot','Best Buy','Farmer Pick','New',''] }, tags: [String],
  ratings: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
  isActive: { type: Boolean, default: true }, isFeatured: { type: Boolean, default: false }
}, { timestamps: true });
productSchema.index({ 
  'name.en': 'text', 
  'name.hi': 'text', 
  'name.mr': 'text', 
  'description.en': 'text', 
  'description.hi': 'text', 
  'description.mr': 'text', 
  'category.en': 'text', 
  'category.hi': 'text', 
  'category.mr': 'text', 
  tags: 'text' 
});
module.exports = mongoose.model('Product', productSchema);
