const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return next(new AppError('Unauthorized: Please log in to gain access.', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await userRepository.findById(decoded.id);

    if (!req.user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    next();
  } catch (err) {
    return next(new AppError('Invalid session token. Please log in again.', 401));
  }
});

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('Forbidden: Admin access only.', 403));
  }
  next();
};

const optionalAuth = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await userRepository.findById(decoded.id);
    } catch (err) {
      // Keep going without attaching req.user
    }
  }
  next();
});

module.exports = { protect, adminOnly, optionalAuth };
