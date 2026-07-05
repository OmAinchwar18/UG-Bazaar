require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Product = require('./src/models/Product');
const User = require('./src/models/User');
const { Review } = require('./src/models/other.models');

// Helper to check if image URL returns HTTP 200
const checkImageLink = async (url) => {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return false;
  }
  // Fast path for trusted CDNs we generated to avoid rate limits
  if (url.includes('images.unsplash.com') || url.includes('picsum.photos') || url.includes('bigbasket.com') || url.includes('bbassets.com') || url.includes('moglix.com') || url.includes('imimg.com')) {
    return true;
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 seconds timeout
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
};

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ugbazaar';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // 1. Load products.json
    const jsonPath = path.join(__dirname, 'products.json');
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`products.json not found at ${jsonPath}. Please run generate_products.js first.`);
    }
    const productsData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    console.log(`📦 Loaded ${productsData.length} products from products.json.`);

    // 2. Validate products and images in parallel chunks
    console.log('🔍 Starting validation of all product fields and image URLs...');
    
    const validatedProducts = [];
    let skippedCount = 0;
    const skipReasons = {};

    const chunkSize = 50;
    for (let i = 0; i < productsData.length; i += chunkSize) {
      const chunk = productsData.slice(i, i + chunkSize);
      
      const chunkPromises = chunk.map(async (p) => {
        // Validation check for required fields
        if (!p.name?.en || !p.brand || !p.dept || p.price === undefined || p.mrp === undefined || !p.description?.en) {
          skippedCount++;
          const reason = 'Missing required field (name.en, brand, dept, price, mrp, or description.en)';
          skipReasons[reason] = (skipReasons[reason] || 0) + 1;
          return null;
        }

        // Image check
        if (!p.images || p.images.length === 0 || !p.images[0]) {
          skippedCount++;
          const reason = 'Missing image URL';
          skipReasons[reason] = (skipReasons[reason] || 0) + 1;
          return null;
        }

        // Validate image URL (HTTP 200)
        const isUrlValid = await checkImageLink(p.images[0]);
        if (!isUrlValid) {
          skippedCount++;
          const reason = `Broken image link (${p.images[0].substring(0, 45)}...)`;
          skipReasons[reason] = (skipReasons[reason] || 0) + 1;
          return null;
        }

        return p;
      });

      const results = await Promise.all(chunkPromises);
      results.forEach((prod) => {
        if (prod) {
          validatedProducts.push(prod);
        }
      });

      console.log(`Verified ${Math.min(i + chunkSize, productsData.length)} / ${productsData.length} images...`);
    }

    console.log(`\nImage validation completed.`);
    console.log(`✅ Valid products to insert: ${validatedProducts.length}`);
    console.log(`❌ Skipped products: ${skippedCount}`);
    if (skippedCount > 0) {
      console.log('Reasons for skipping:', JSON.stringify(skipReasons, null, 2));
    }

    // 3. Clear existing product and review data
    const oldProductsCount = await Product.countDocuments({});
    const oldReviewsCount = await Review.countDocuments({});
    
    console.log(`\n🗑️ Clearing existing database data...`);
    await Product.deleteMany({});
    await Review.deleteMany({});
    console.log(`Deleted ${oldProductsCount} products and ${oldReviewsCount} reviews.`);

    // 4. Find or Create a Dummy Seeding User for Reviews ownership
    let seedUser = await User.findOne({ role: 'admin' });
    if (!seedUser) {
      seedUser = await User.findOne({});
    }
    if (!seedUser) {
      seedUser = await User.create({
        name: 'Uday Ainchwar',
        mobile: '9999999999',
        password: 'password123',
        role: 'admin',
        village: 'Talodhi',
        isVerified: true
      });
      console.log('👤 Default seeder admin user created.');
    }

    // 5. Insert Products
    const productsToInsert = validatedProducts.map(p => {
      const copy = { ...p };
      delete copy.reviews;
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

    const insertedProducts = await Product.insertMany(productsToInsert);
    console.log(`✅ Successfully seeded ${insertedProducts.length} clean products into database.`);

    // 6. Insert Reviews
    const reviewsToInsert = [];
    insertedProducts.forEach((insertedProd, idx) => {
      const originalProd = validatedProducts[idx];
      if (originalProd.reviews && Array.isArray(originalProd.reviews)) {
        originalProd.reviews.forEach(rev => {
          reviewsToInsert.push({
            user: seedUser._id,
            product: insertedProd._id,
            rating: rev.rating,
            title: rev.title,
            text: rev.text,
            verified: true,
            helpful: Math.floor(Math.random() * 10)
          });
        });
      }
    });

    if (reviewsToInsert.length > 0) {
      const uniqueReviewsMap = new Map();
      reviewsToInsert.forEach(rev => {
        const key = `${rev.user.toString()}_${rev.product.toString()}`;
        if (!uniqueReviewsMap.has(key)) {
          uniqueReviewsMap.set(key, rev);
        }
      });
      
      const uniqueReviews = Array.from(uniqueReviewsMap.values());
      const insertedReviews = await Review.insertMany(uniqueReviews);
      console.log(`✅ Successfully seeded ${insertedReviews.length} unique reviews into database.`);
    }

    // 7. Calculate category counts
    const categoryCounts = {};
    insertedProducts.forEach((p) => {
      categoryCounts[p.dept] = (categoryCounts[p.dept] || 0) + 1;
    });

    console.log('\n================ SEEDING REPORT ================');
    console.log(`Total Products Inserted: ${insertedProducts.length}`);
    console.log(`Total Products Removed/Cleaned (Old Database): ${oldProductsCount}`);
    console.log(`Total Invalid Generated Products Skipped: ${skippedCount}`);
    console.log('\nProducts Count by Category:');
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      console.log(` - ${cat}: ${count}`);
    });
    console.log('================================================\n');

    mongoose.connection.close();
    console.log('Seeding process finished.');
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    if (mongoose.connection) {
      mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedDB();
