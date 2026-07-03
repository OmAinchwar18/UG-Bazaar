const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { isCloudinaryAvailable, cloudinary } = require('../config/cloudinary');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const AppError = require('../utils/appError');

// Ensure local uploads directory exists
const localUploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return cb(new AppError('Invalid image format. Only JPG, JPEG, PNG, and WebP are allowed.', 400), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter
}).array('files', 8);

router.post('/', protect, adminOnly, (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, message: 'File is too large. Maximum size allowed is 5 MB per image.' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ success: false, message: 'Too many files. Maximum limit is 8 images per product.' });
        }
        return res.status(400).json({ success: false, message: err.message });
      }
      return res.status(err.statusCode || 400).json({ success: false, message: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload at least one image file.' });
    }

    try {
      const urls = [];
      if (isCloudinaryAvailable) {
        // Stream buffers to Cloudinary
        for (const file of req.files) {
          const uploadPromise = new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: 'ugbazaar_products' },
              (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              }
            );
            stream.end(file.buffer);
          });
          const url = await uploadPromise;
          urls.push(url);
        }
      } else {
        // Save to local public/uploads directory
        const serverUrl = `${req.protocol}://${req.get('host')}`;
        for (const file of req.files) {
          const fileName = `product-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`;
          const filePath = path.join(localUploadsDir, fileName);
          fs.writeFileSync(filePath, file.buffer);
          urls.push(`${serverUrl}/uploads/${fileName}`);
        }
      }

      res.status(200).json({
        success: true,
        urls
      });
    } catch (error) {
      console.error('Upload Error:', error);
      res.status(500).json({ success: false, message: 'Failed to upload images. Please try again.' });
    }
  });
});

const uploadForReturn = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter
}).array('files', 5);

router.post('/return', protect, (req, res, next) => {
  uploadForReturn(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, message: 'File is too large. Maximum size allowed is 5 MB per image.' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ success: false, message: 'Too many files. Maximum limit is 5 images per return request.' });
        }
        return res.status(400).json({ success: false, message: err.message });
      }
      return res.status(err.statusCode || 400).json({ success: false, message: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload at least one image file.' });
    }

    try {
      const urls = [];
      if (isCloudinaryAvailable) {
        for (const file of req.files) {
          const uploadPromise = new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: 'ugbazaar_returns' },
              (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              }
            );
            stream.end(file.buffer);
          });
          const url = await uploadPromise;
          urls.push(url);
        }
      } else {
        const serverUrl = `${req.protocol}://${req.get('host')}`;
        for (const file of req.files) {
          const fileName = `return-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`;
          const filePath = path.join(localUploadsDir, fileName);
          fs.writeFileSync(filePath, file.buffer);
          urls.push(`${serverUrl}/uploads/${fileName}`);
        }
      }

      res.status(200).json({
        success: true,
        urls
      });
    } catch (error) {
      console.error('Upload Error:', error);
      res.status(500).json({ success: false, message: 'Failed to upload return images. Please try again.' });
    }
  });
});

module.exports = router;
