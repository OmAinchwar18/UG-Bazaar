const mongoose = require('mongoose');
const Product = require('./src/models/Product');
require('dotenv').config();

const createProduct = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ugbazaar';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Delete any existing BPL product first to have a clean state
    await Product.deleteMany({ name: /BPL/i });

    const p = await Product.create({
      name: 'BPL Mix-Xpert 2.55 Mixer Grinder',
      brand: 'BPL',
      dept: 'Home Appliances',
      price: 2999,
      mrp: 3999,
      stock: 50,
      minStockLevel: 5,
      description: 'Multi-functional mixer grinder with premium stainless steel jars.',
      images: [
        {
          url: 'http://localhost:5000/uploads/product-1782363560752-633512689.webp',
          isPrimary: true
        },
        {
          url: 'http://localhost:5000/uploads/product-1782363560755-945121948.webp',
          isPrimary: false
        },
        {
          url: 'http://localhost:5000/uploads/product-1782363560756-877324784.webp',
          isPrimary: false
        }
      ],
      isActive: true
    });

    console.log('Successfully created product:');
    console.log(JSON.stringify(p, null, 2));

  } catch (err) {
    console.error('Error creating product:', err);
  } finally {
    await mongoose.connection.close();
  }
};

createProduct();
