const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.generateToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      village: user.village,
      role: user.role
    }
  });
};

exports.register = catchAsync(async (req, res, next) => {
  const { name, mobile, password, village, role } = req.body;
  const result = await authService.register({ name, mobile, password, village, role });
  sendTokenResponse(result.user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { mobile, password } = req.body;
  const result = await authService.login(mobile, password);
  sendTokenResponse(result.user, 200, res);
});

exports.sendOTP = catchAsync(async (req, res, next) => {
  const { mobile } = req.body;
  await authService.sendOTP(mobile);
  res.status(200).json({
    success: true,
    message: 'OTP sent successfully!'
  });
});

exports.verifyOTP = catchAsync(async (req, res, next) => {
  const { mobile, otp } = req.body;
  const result = await authService.verifyOTP(mobile, otp);
  sendTokenResponse(result.user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { mobile } = req.body;
  await authService.forgotPassword(mobile);
  res.status(200).json({
    success: true,
    message: 'Reset OTP has been sent via SMS.'
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { mobile, otp, newPassword } = req.body;
  await authService.resetPassword(mobile, otp, newPassword);
  res.status(200).json({
    success: true,
    message: 'Password reset successful!'
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const user = await authService.updateProfile(req.user._id, req.body);
  res.status(200).json({
    success: true,
    user
  });
});

exports.toggleWishlist = catchAsync(async (req, res, next) => {
  const { productId } = req.body;
  const result = await authService.toggleWishlist(req.user._id, productId);
  res.status(200).json({
    success: true,
    ...result
  });
});

exports.getWishlist = catchAsync(async (req, res, next) => {
  const wishlist = await authService.getWishlist(req.user._id);
  res.status(200).json({
    success: true,
    wishlist
  });
});

exports.googleLogin = catchAsync(async (req, res, next) => {
  const { idToken } = req.body;
  const result = await authService.googleLogin(idToken);
  sendTokenResponse(result.user, 200, res);
});
