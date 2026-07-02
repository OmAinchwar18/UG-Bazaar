const mongoose = require('mongoose');
const Product = require('./src/models/Product');
require('dotenv').config();

const run = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ugbazaar';
    await mongoose.connect(mongoUri);
    const products = await Product.find({}).limit(5);
    console.log('PRODUCTS IMAGES:', JSON.stringify(products.map(p => ({ name: p.name, images: p.images })), null, 2));
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
};
run();
