const otherService = require('../services/other.service');
const userRepository = require('../repositories/user.repository');
const Product = require('../models/Product');
const { Coupon } = require('../models/other.models');
const catchAsync = require('../utils/catchAsync');
const https = require('https');
const logger = require('../utils/logger');

// CART
exports.getCart = catchAsync(async (req, res, next) => {
  const cart = await otherService.getCart(req.user._id);
  res.status(200).json({
    success: true,
    cart
  });
});

exports.addToCart = catchAsync(async (req, res, next) => {
  const { productId, qty } = req.body;
  const cart = await otherService.addToCart(req.user._id, productId, qty);
  res.status(200).json({
    success: true,
    message: 'Item added to cart successfully',
    cart
  });
});

exports.updateCartItem = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { qty } = req.body;
  const cart = await otherService.updateCartItem(req.user._id, productId, qty);
  res.status(200).json({
    success: true,
    cart
  });
});

exports.clearCart = catchAsync(async (req, res, next) => {
  await otherService.clearCart(req.user._id);
  res.status(200).json({
    success: true,
    message: 'Cart cleared successfully'
  });
});

// REVIEW
exports.getReviews = catchAsync(async (req, res, next) => {
  const reviews = await otherService.getReviews(req.params.productId);
  res.status(200).json({
    success: true,
    count: reviews.length,
    reviews
  });
});

exports.submitReview = catchAsync(async (req, res, next) => {
  const review = await otherService.submitReview(req.user._id, req.body);
  res.status(201).json({
    success: true,
    message: 'Review submitted successfully',
    review
  });
});

// COUPON
exports.getCoupons = catchAsync(async (req, res, next) => {
  const coupons = await otherService.getCoupons();
  res.status(200).json({
    success: true,
    coupons
  });
});

exports.createCoupon = catchAsync(async (req, res, next) => {
  const coupon = await otherService.createCoupon(req.body);
  res.status(201).json({
    success: true,
    coupon
  });
});

exports.deleteCoupon = catchAsync(async (req, res, next) => {
  await otherService.deleteCoupon(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Coupon deleted successfully'
  });
});

exports.validateCoupon = catchAsync(async (req, res, next) => {
  const { code, orderTotal } = req.body;
  const result = await otherService.validateCoupon(req.user._id, code, orderTotal);
  res.status(200).json({
    success: true,
    ...result
  });
});

// SETTINGS
exports.getSettings = catchAsync(async (req, res, next) => {
  const settings = await otherService.getSettings();
  res.status(200).json({
    success: true,
    settings
  });
});

exports.updateSettings = catchAsync(async (req, res, next) => {
  const settings = await otherService.updateSettings(req.body);
  res.status(200).json({
    success: true,
    message: 'Settings updated successfully',
    settings
  });
});

// NOTIFICATIONS
exports.getNotifications = catchAsync(async (req, res, next) => {
  const notifications = await otherService.getNotifications(req.user._id);
  const unreadCount = notifications.filter(n => !n.read).length;
  res.status(200).json({
    success: true,
    unread: unreadCount,
    notifications
  });
});

exports.markNotificationRead = catchAsync(async (req, res, next) => {
  await otherService.markNotificationRead(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Notification marked as read'
  });
});

exports.markAllNotificationsRead = catchAsync(async (req, res, next) => {
  await otherService.markAllNotificationsRead(req.user._id);
  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// CUSTOMERS (Admin)
exports.adminGetCustomers = catchAsync(async (req, res, next) => {
  const users = await userRepository.findAllCustomers();
  res.status(200).json({
    success: true,
    users
  });
});

// CHATBOT
exports.chatbot = catchAsync(async (req, res, next) => {
  const { message, system, history, lang } = req.body;
  const GEMINI_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_KEY) {
    return res.status(500).json({
      success: false,
      reply: "Gemini API key has not been configured in the environment variables."
    });
  }

  let contents = [];
  let systemInstructionText = system || '';
  if (lang) {
    const langNames = { en: 'English', hi: 'Hindi', mr: 'Marathi' };
    const langName = langNames[lang] || 'English';
    systemInstructionText += `\n\nIMPORTANT: The customer's selected display language is: ${lang}. You MUST write your response ONLY in the language: ${langName} (using native script where appropriate, e.g. Devanagari script for Hindi/Marathi).`;
  }


  const isChatbot = !!history || (systemInstructionText && systemInstructionText.toLowerCase().includes("friendly shop assistant"));

  if (isChatbot) {
    try {
      const activeProducts = await Product.find({ isActive: true });
      const activeCoupons = await Coupon.find({ isActive: true });

      const productsContext = activeProducts.map(p => 
        `- ${p.name} (📦): Price ₹${p.price} (MRP: ₹${p.mrp}), Stock: ${p.stock > 0 ? p.stock + ' units left' : 'Out of Stock'}, Department: ${p.dept}, Badge: ${p.badge || 'None'}, ID: ${p._id}`
      ).join('\n');

      const couponsContext = activeCoupons.map(c => 
        `- ${c.code}: Value: ${c.value}, Type: ${c.type}, Min Order: ₹${c.minOrder}, Active: ${c.isActive}`
      ).join('\n');

      systemInstructionText += `\n\nLIVE PRODUCT CATALOG IN STORE:\n${productsContext}\n\nLIVE ACTIVE COUPONS:\n${couponsContext}\n\nNavigation Guidelines:\n- When a customer asks about a product, check the catalog above and recommend it. Mention its price and department. Tell them they can view it by going to "product.html?id=[ID]" or search by going to "search.html?q=[SearchTerm]".\n- If they ask how to buy, tell them they can add the product to their cart on the website using "+ Add", go to "cart.html" to checkout and apply coupon codes, view profile on "profile.html", track orders on "tracking.html", or login/register on "auth.html".`;
    } catch (dbErr) {
      logger.error('Error fetching live data for chatbot context:', dbErr);
    }
  }

  if (history && Array.isArray(history)) {
    contents = history.map(item => ({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: item.text }]
    }));
  } else {
    contents = [{
      role: 'user',
      parts: [{ text: message || '' }]
    }];
  }

  const postData = JSON.stringify({
    contents,
    systemInstruction: systemInstructionText ? {
      parts: [{ text: systemInstructionText }]
    } : undefined
  });

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: '/v1beta/models/gemini-2.5-flash:generateContent?key=' + GEMINI_KEY,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const reply = await new Promise((resolve, reject) => {
    const request = https.request(options, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            logger.error('Gemini API Error details:', parsed.error);
            resolve('Gemini Error: ' + parsed.error.message);
          } else {
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            resolve(text || 'Sorry, I was unable to generate a response at this moment.');
          }
        } catch(e) {
          logger.error('Gemini Parse Error:', e);
          resolve('Sorry, there was a parsing issue processing the reply.');
        }
      });
    });
    request.on('error', (err) => {
      logger.error('Gemini Request Error:', err);
      reject(err);
    });
    request.write(postData);
    request.end();
  });

  res.json({ success: true, reply });
});

exports.adminGetAnalyticsSummary = catchAsync(async (req, res, next) => {
  const summary = await otherService.getAnalyticsSummary();
  res.status(200).json({
    success: true,
    analytics: summary
  });
});

exports.adminExportAnalyticsReport = catchAsync(async (req, res, next) => {
  const { format } = req.query; // 'csv' or 'pdf'
  const summary = await otherService.getAnalyticsSummary();
  
  if (format === 'csv') {
    const csvContent = await otherService.exportAnalyticsCSV();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="analytics-report.csv"');
    return res.status(200).send(csvContent);
  } else {
    // Generate PDF report
    const pdfService = require('../services/pdf.service');
    const path = require('path');
    const fs = require('fs');
    
    const relativeReportPath = '/uploads/reports/analytics-report.pdf';
    const fullPath = path.join(__dirname, '..', '..', 'public', relativeReportPath);
    
    await pdfService.generateAnalyticsPdf(summary, fullPath);
    
    res.download(fullPath, 'analytics-report.pdf');
  }
});

exports.translateProductDetails = catchAsync(async (req, res, next) => {
  const { name, description, category, specifications, features } = req.body;
  const GEMINI_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_KEY) {
    return res.status(500).json({
      success: false,
      message: "Gemini API key has not been configured in the environment variables."
    });
  }

  const promptText = `You are a translation assistant for a hyperlocal marketplace in Maharashtra, India.
Translate the following product details into Hindi and Marathi.
Maintain absolute accuracy, appropriate context, and natural phrasing. Keep units of measurement (e.g., kg, L, watt, mm) in their standard or localized forms.
Return ONLY a valid JSON object matching the format below. Do not wrap the JSON in markdown blocks (like \`\`\`json) or include any extra text.

Response format:
{
  "hi": {
    "name": "translated name in Hindi",
    "description": "translated description in Hindi",
    "category": "translated category in Hindi",
    "specifications": [{ "key": "translated key", "value": "translated value" }],
    "features": ["translated feature 1", "translated feature 2"]
  },
  "mr": {
    "name": "translated name in Marathi",
    "description": "translated description in Marathi",
    "category": "translated category in Marathi",
    "specifications": [{ "key": "translated key", "value": "translated value" }],
    "features": ["translated feature 1", "translated feature 2"]
  }
}

Input data to translate:
${JSON.stringify({ name, description, category, specifications, features }, null, 2)}`;

  const postData = JSON.stringify({
    contents: [{
      role: 'user',
      parts: [{ text: promptText }]
    }]
  });

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: '/v1beta/models/gemini-2.5-flash:generateContent?key=' + GEMINI_KEY,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const reply = await new Promise((resolve, reject) => {
    const request = https.request(options, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            logger.error('Gemini API Translation Error details:', parsed.error);
            reject(new Error(parsed.error.message));
          } else {
            let text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
            // Clean markdown json formatting if any exists
            text = text.replace(/```json/i, '').replace(/```/g, '').trim();
            resolve(JSON.parse(text));
          }
        } catch(e) {
          logger.error('Gemini Translation Parse Error:', e, data);
          reject(new Error('Failed to parse translated content from Gemini AI.'));
        }
      });
    });
    request.on('error', (err) => {
      logger.error('Gemini Translation Request Error:', err);
      reject(err);
    });
    request.write(postData);
    request.end();
  });

  res.json({ success: true, translations: reply });
});

