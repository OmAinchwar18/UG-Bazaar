require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

const checkImageLink = async (url) => {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return false;
  }
  // Fast path for trusted CDNs we generated to avoid rate limits
  if (url.includes('images.unsplash.com') || url.includes('picsum.photos') || url.includes('bigbasket.com') || url.includes('moglix.com') || url.includes('imimg.com')) {
    return true;
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok; // true if status is 2xx
  } catch (error) {
    return false;
  }
};

const validateCatalog = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ugbazaar';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const products = await Product.find({});
    console.log(`Analyzing ${products.length} products in database...`);

    let removedCount = 0;
    const seenNames = new Set();
    const toDeleteIds = [];

    for (const p of products) {
      let isInvalid = false;
      let reason = '';

      // 1. Check for missing required fields
      if (!p.name || !p.price || p.mrp === undefined || !p.dept) {
        isInvalid = true;
        reason = 'Missing required field (name, price, mrp, or dept)';
      }

      // 2. Check for empty or missing images
      if (!isInvalid && (!p.images || p.images.length === 0 || !p.images[0] || p.images[0].trim() === '')) {
        isInvalid = true;
        reason = 'Empty or missing image URL';
      }

      // 3. Check for duplicates by name (case-insensitive)
      if (!isInvalid) {
        const normalizedName = p.name.trim().toLowerCase();
        if (seenNames.has(normalizedName)) {
          isInvalid = true;
          reason = `Duplicate product name: "${p.name}"`;
        } else {
          seenNames.add(normalizedName);
        }
      }

      // 4. Check for broken image links (only if not already marked invalid)
      if (!isInvalid) {
        const imageUrl = p.images[0];
        const isValidImage = await checkImageLink(imageUrl);
        if (!isValidImage) {
          isInvalid = true;
          reason = `Broken or unreachable image URL: ${imageUrl}`;
        }
      }

      if (isInvalid) {
        console.log(`❌ Invalid Product: ID: ${p._id} | Name: "${p.name}" | Reason: ${reason}`);
        toDeleteIds.push(p._id);
      }
    }

    if (toDeleteIds.length > 0) {
      console.log(`Removing ${toDeleteIds.length} invalid/duplicate products from MongoDB...`);
      const deleteResult = await Product.deleteMany({ _id: { $in: toDeleteIds } });
      removedCount = deleteResult.deletedCount;
      console.log(`✅ Successfully removed ${removedCount} products.`);
    } else {
      console.log('✨ All existing products are valid!');
    }

    const remainingCount = await Product.countDocuments({});
    console.log('\n--- Catalog Validation Report ---');
    console.log(`Total checked: ${products.length}`);
    console.log(`Total removed: ${removedCount}`);
    console.log(`Total remaining: ${remainingCount}`);
    console.log('---------------------------------\n');

  } catch (error) {
    console.error('❌ Error validating catalog:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

validateCatalog();
