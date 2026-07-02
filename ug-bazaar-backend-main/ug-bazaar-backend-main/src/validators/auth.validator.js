const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().required().min(2).max(50).messages({
    'any.required': 'Naam daalna zaroori hai',
    'string.empty': 'Naam khali nahi hona chahiye',
    'string.min': 'Naam kam se kam 2 characters ka hona chahiye'
  }),
  mobile: Joi.string().required().pattern(/^[6-9]\d{9}$/).messages({
    'any.required': 'Mobile number zaroori hai',
    'string.pattern.base': 'Kripya ek valid 10-digit Indian mobile number daalein'
  }),
  password: Joi.string().required().min(6).messages({
    'any.required': 'Password zaroori hai',
    'string.min': 'Password kam se kam 6 characters ka hona chahiye'
  }),
  village: Joi.string().allow('').optional(),
  role: Joi.string().valid('user').default('user').optional()
});

const loginSchema = Joi.object({
  mobile: Joi.string().required().messages({
    'any.required': 'Mobile number ya name daalna zaroori hai',
    'string.empty': 'Login field khali nahi ho sakti'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password daalo',
    'string.empty': 'Password khali nahi ho sakta'
  })
});

const sendOtpSchema = Joi.object({
  mobile: Joi.string().required().pattern(/^[6-9]\d{9}$/).messages({
    'string.pattern.base': 'Sahi 10-digit mobile number daalein'
  })
});

const verifyOtpSchema = Joi.object({
  mobile: Joi.string().required().pattern(/^[6-9]\d{9}$/),
  otp: Joi.string().required().length(6).messages({
    'string.length': 'OTP 6 digits ka hona chahiye'
  })
});

module.exports = {
  registerSchema,
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema
};
