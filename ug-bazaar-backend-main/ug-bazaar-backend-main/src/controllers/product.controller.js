const productService = require('../services/product.service');
const catchAsync = require('../utils/catchAsync');

exports.getProducts = catchAsync(async (req, res, next) => {
  const result = await productService.getProducts(req.query);
  res.status(200).json({
    success: true,
    total: result.total,
    products: result.products
  });
});

exports.searchProducts = catchAsync(async (req, res, next) => {
  const { q, dept } = req.query;
  const products = await productService.searchProducts(q, dept);
  res.status(200).json({
    success: true,
    count: products.length,
    products
  });
});

exports.getProductById = catchAsync(async (req, res, next) => {
  const product = await productService.getProductById(req.params.id);
  res.status(200).json({
    success: true,
    product
  });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json({
    success: true,
    product
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.status(200).json({
    success: true,
    product
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  await productService.deleteProduct(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Product deleted successfully (soft delete)'
  });
});

exports.getRecommendations = catchAsync(async (req, res, next) => {
  const { productId, limit } = req.query;
  const recommendations = await productService.getRecommendations(productId, limit ? Number(limit) : 5);
  res.status(200).json({
    success: true,
    recommendations
  });
});

exports.adjustStock = catchAsync(async (req, res, next) => {
  const { qtyChange, type, note } = req.body;
  const { product, log } = await productService.adjustStock(
    req.params.id,
    Number(qtyChange),
    type,
    note,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: 'Stock adjusted successfully',
    product,
    log
  });
});

exports.getInventoryLogs = catchAsync(async (req, res, next) => {
  const logs = await productService.getInventoryLogs(req.params.id);
  res.status(200).json({
    success: true,
    logs
  });
});

exports.getLowStockProducts = catchAsync(async (req, res, next) => {
  const products = await productService.getLowStockProducts();
  res.status(200).json({
    success: true,
    count: products.length,
    products
  });
});
