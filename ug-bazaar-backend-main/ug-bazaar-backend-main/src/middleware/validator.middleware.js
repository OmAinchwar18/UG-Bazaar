const AppError = require('../utils/appError');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
  if (error) {
    const details = error.details.map(d => d.message).join(', ');
    return next(new AppError(`Validation Error: ${details}`, 400));
  }
  next();
};

module.exports = validate;
