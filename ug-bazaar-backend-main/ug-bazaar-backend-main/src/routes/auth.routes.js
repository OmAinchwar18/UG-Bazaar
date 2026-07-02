const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validator.middleware');
const { 
  registerSchema, 
  loginSchema, 
  sendOtpSchema, 
  verifyOtpSchema 
} = require('../validators/auth.validator');

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/send-otp', validate(sendOtpSchema), authController.sendOTP);
router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOTP);
router.post('/forgot-password', validate(sendOtpSchema), authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/google-login', authController.googleLogin);

router.get('/me', protect, authController.getMe);
router.put('/update-profile', protect, authController.updateProfile);

router.post('/wishlist/toggle', protect, authController.toggleWishlist);
router.get('/wishlist', protect, authController.getWishlist);

module.exports = router;
