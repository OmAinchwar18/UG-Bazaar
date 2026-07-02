require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Product = require('./src/models/Product');
const { Review } = require('./src/models/other.models');

const importProducts = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ugbazaar';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // 1. Delete all existing products and reviews from the database
    console.log('🗑️ Clearing all existing products and reviews from MongoDB...');
    const deletedProductsResult = await Product.deleteMany({});
    const deletedReviewsResult = await Review.deleteMany({});
    console.log(`Deleted ${deletedProductsResult.deletedCount} products and ${deletedReviewsResult.deletedCount} reviews.`);

    // 2. Read products.json
    const jsonPath = path.join(__dirname, 'products.json');
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`products.json not found at ${jsonPath}. Please run generate_products.js first.`);
    }
    
    console.log(`Reading products from ${jsonPath}...`);
    const productsData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    console.log(`Loaded ${productsData.length} products from products.json.`);

    // 3. Insert products into the database
    console.log(`Importing ${productsData.length} products into MongoDB...`);
    const formattedProducts = productsData.map(p => {
      const copy = { ...p };
      if (copy.images && Array.isArray(copy.images)) {
        copy.images = copy.images.map((img, idx) => {
          if (typeof img === 'string') {
            return { url: img, isPrimary: idx === 0 };
          }
          return img;
        });
      }
      return copy;
    });
    const insertedProducts = await Product.insertMany(formattedProducts);
    console.log(`✅ Successfully imported ${insertedProducts.length} products!`);

    // 4. Calculate category counts
    const categoryCounts = {};
    insertedProducts.forEach((p) => {
      categoryCounts[p.dept] = (categoryCounts[p.dept] || 0) + 1;
    });

    console.log('\n================ IMPORT REPORT ================');
    console.log(`Total Products Inserted: ${insertedProducts.length}`);
    console.log(`Total Products Deleted: ${deletedProductsResult.deletedCount}`);
    console.log('\nProducts Count by Category:');
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      console.log(` - ${cat}: ${count}`);
    });
    console.log('================================================\n');

  } catch (error) {
    console.error('❌ Error during import:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

importProducts();
