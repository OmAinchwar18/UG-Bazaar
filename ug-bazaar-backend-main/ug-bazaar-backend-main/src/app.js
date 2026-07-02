const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const errorMiddleware = require('./middleware/error.middleware');
const logger = require('./utils/logger');

const app = express();

// 1. SECURITY MIDDLEWARE
app.use(helmet());

// Secure CORS configuration
app.use(cors({
  origin: true, // Echoes back request origin, allowing all during local tests
  credentials: true
}));

// NoSQL Injection protection
app.use(mongoSanitize());

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Max 300 requests per IP per 15 minutes
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// 2. PARSING & COOKIES
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request structured logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// 3. API ROUTING
const { paymentRouter, cartRouter, reviewRouter, couponRouter, adminRouter, notifRouter, chatRouter } = require('./routes/other.routes');
const authRouter = require('./routes/auth.routes');
const productRouter = require('./routes/product.routes');
const orderRouter = require('./routes/order.routes');
const uploadRouter = require('./routes/upload.routes');
const path = require('path');

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.use('/api/auth',          authRouter);
app.use('/api/products',      productRouter);
app.use('/api/orders',        orderRouter);
app.use('/api/payment',       paymentRouter);
app.use('/api/cart',          cartRouter);
app.use('/api/reviews',       reviewRouter);
app.use('/api/coupons',       couponRouter);
app.use('/api/admin',         adminRouter);
app.use('/api/notifications', notifRouter);
app.use('/api/chat',          chatRouter);
app.use('/api/upload',        uploadRouter);

// Base route fallback
app.get('/', (req, res) => res.json({ success: true, message: '🛒 UG Bazaar API running!' }));

app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// 4. GLOBAL ERROR HANDLER
app.use(errorMiddleware);

module.exports = app;
