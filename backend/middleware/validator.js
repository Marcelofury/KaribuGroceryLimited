const { validationResult, body } = require('express-validator');

/**
 * Validate request using express-validator
 * @param {Array} validations - Array of express-validator validation chains
 * @returns {Function} Express middleware function
 */
exports.validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations in parallel
    await Promise.all(validations.map(validation => validation.run(req)));
    
    // Check for validation errors
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }
    
    next();
  };
};

/**
 * Procurement validation rules
 * - Minimum quantity: 100 kg (3 characters in spec = >= 100)
 * - Minimum cost price: 10,000 UGX (5 characters in spec = >= 10000)
 */
exports.validateProcurement = [
  body('quantity')
    .isNumeric()
    .withMessage('Quantity must be numeric')
    .custom((value) => {
      if (value < 1000) {
        throw new Error('Minimum procurement quantity is 1000 kg (1 tonne)');
      }
      return true;
    }),
  body('costPrice')
    .optional()
    .isNumeric()
    .withMessage('Cost price must be numeric')
    .custom((value) => {
      if (value && value < 100) {
        throw new Error('Minimum cost price is 100 UGX per kg');
      }
      return true;
    }),
  body('dealerName')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Dealer name must be at least 2 characters'),
  body('dealerContact')
    .optional()
    .matches(/^(\+256|0)[0-9]{9}$/)
    .withMessage('Invalid phone number format')
];

/**
 * Credit sale validation rules
 */
exports.validateCreditSale = [
  body('customerNationalId')
    .if((value, { req }) => req.body.isCreditSale === true)
    .notEmpty()
    .withMessage('National ID is required for credit sales')
    .matches(/^[A-Z]{2}[0-9]{14}$/)
    .withMessage('Invalid NIN format (e.g., CM12345678901234)'),
  body('customerLocation')
    .if((value, { req }) => req.body.isCreditSale === true)
    .notEmpty()
    .withMessage('Location is required for credit sales')
    .isLength({ min: 2 })
    .withMessage('Location must be at least 2 characters'),
  body('dueDate')
    .if((value, { req }) => req.body.isCreditSale === true)
    .notEmpty()
    .withMessage('Due date is required for credit sales')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('customerName')
    .if((value, { req }) => req.body.isCreditSale === true)
    .notEmpty()
    .withMessage('Customer name is required for credit sales')
    .isLength({ min: 2 })
    .withMessage('Customer name must be at least 2 characters')
];

/**
 * Sales amount validation
 */
exports.validateSaleAmount = [
  body('totalAmount')
    .optional()
    .isNumeric()
    .withMessage('Total amount must be numeric')
    .custom((value) => {
      if (value && value < 10000) {
        throw new Error('Minimum sale amount is 10,000 UGX (not less than 5 characters)');
      }
      return true;
    })
];
