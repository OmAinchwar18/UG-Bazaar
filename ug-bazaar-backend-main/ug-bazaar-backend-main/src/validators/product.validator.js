const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.object({
    en: Joi.string().required().trim().min(2).max(100),
    hi: Joi.string().allow('').optional().trim(),
    mr: Joi.string().allow('').optional().trim()
  }).required(),
  description: Joi.object({
    en: Joi.string().allow('').optional().trim(),
    hi: Joi.string().allow('').optional().trim(),
    mr: Joi.string().allow('').optional().trim()
  }).optional(),
  category: Joi.object({
    en: Joi.string().allow('').optional().trim(),
    hi: Joi.string().allow('').optional().trim(),
    mr: Joi.string().allow('').optional().trim()
  }).optional(),
  specifications: Joi.array().items(
    Joi.object({
      key: Joi.object({
        en: Joi.string().required(),
        hi: Joi.string().allow('').optional(),
        mr: Joi.string().allow('').optional()
      }).required(),
      value: Joi.object({
        en: Joi.string().required(),
        hi: Joi.string().allow('').optional(),
        mr: Joi.string().allow('').optional()
      }).required()
    })
  ).optional(),
  features: Joi.array().items(
    Joi.object({
      en: Joi.string().required(),
      hi: Joi.string().allow('').optional(),
      mr: Joi.string().allow('').optional()
    })
  ).optional(),
  dept: Joi.string().required().valid(
    'Grocery', 'Agriculture', 'Building Materials', 'Hardware Tools', 'Plumbing',
    'Electrical', 'Furniture', 'Home Appliances', 'Electronics', 'General Store',
    'Mobiles', 'Fashion', 'Beauty', 'Home & Kitchen', 'Hardware', 'Krushi Kendra'
  ),
  price: Joi.number().required().min(0),
  mrp: Joi.number().required().min(Joi.ref('price')).messages({
    'number.min': 'MRP must be greater than or equal to the selling Price'
  }),
  cost: Joi.number().min(0).optional(),
  purchasePrice: Joi.number().min(0).optional(),
  stock: Joi.number().integer().min(0).default(0),
  minStockLevel: 'Low Stock' === Joi.number().min(0) ? Joi.number().min(0) : Joi.number().integer().min(0).default(5),
  sku: Joi.string().allow('').optional(),
  supplierName: Joi.string().allow('').optional(),
  images: Joi.array().items(
    Joi.object({
      url: Joi.string().required(),
      isPrimary: Joi.boolean().required()
    })
  ).min(1).required().messages({
    'array.min': 'At least one product image is mandatory',
    'any.required': 'Product images are required'
  }),
  badge: Joi.string().valid('Popular', 'Hot', 'Best Buy', 'Farmer Pick', 'New', '').optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  isFeatured: Joi.boolean().default(false)
});

module.exports = {
  productSchema
};
