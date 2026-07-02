const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth.middleware');
const validate = require('../middleware/validator.middleware');
const { productSchema } = require('../validators/product.validator');

router.get('/', optionalAuth, productController.getProducts);
router.get('/search', productController.searchProducts);
router.get('/recommendations', productController.getRecommendations);
router.get('/admin/inventory/low-stock', protect, adminOnly, productController.getLowStockProducts);
router.get('/:id', productController.getProductById);

router.post('/', protect, adminOnly, validate(productSchema), productController.createProduct);
router.put('/:id', protect, adminOnly, validate(productSchema), productController.updateProduct);
router.delete('/:id', protect, adminOnly, productController.deleteProduct);

router.post('/:id/inventory/adjust', protect, adminOnly, productController.adjustStock);
router.get('/:id/inventory/logs', protect, adminOnly, productController.getInventoryLogs);

module.exports = router;
