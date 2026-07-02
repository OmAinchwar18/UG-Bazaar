const cloudinary = require('cloudinary').v2;

// Determine if Cloudinary is configured with valid, non-placeholder credentials
const isConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_KEY !== 'xxxxxxxxxxxx' &&
  process.env.CLOUDINARY_API_SECRET && 
  process.env.CLOUDINARY_API_SECRET !== 'xxxxxxxxxxxxxxxxxxxxxx';

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('☁️ Cloudinary configured successfully.');
} else {
  console.log('⚠️ Cloudinary not configured or using placeholders. Falling back to local disk storage.');
}

module.exports = {
  cloudinary,
  isCloudinaryAvailable: !!isConfigured
};
