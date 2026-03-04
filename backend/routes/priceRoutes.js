const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { body, param } = require('express-validator');
const {
  getPrices,
  getPriceByProduct,
  getPriceHistory,
  createPrice,
  updatePrice,
  deactivatePrice
} = require('../controllers/priceController');

router.route('/')
  .get(protect, getPrices)
  .post(
    protect,
    authorize('manager'),
    validate([
      body('product').isMongoId().withMessage('Invalid product ID'),
      body('branch').isIn(['Maganjo', 'Matugga']).withMessage('Invalid branch'),
      body('sellingPrice').isNumeric().withMessage('Selling price must be a number'),
      body('costPrice').isNumeric().withMessage('Cost price must be a number')
    ]),
    createPrice
  );

router.get(
  '/product/:productId',
  protect,
  validate([
    param('productId').isMongoId().withMessage('Invalid product ID')
  ]),
  getPriceByProduct
);

router.get(
  '/product/:productId/history',
  protect,
  authorize('manager'),
  validate([
    param('productId').isMongoId().withMessage('Invalid product ID')
  ]),
  getPriceHistory
);

router.route('/:id')
  .put(
    protect,
    authorize('manager'),
    validate([
      param('id').isMongoId().withMessage('Invalid price ID'),
      body('sellingPrice').optional().isNumeric().withMessage('Selling price must be a number'),
      body('costPrice').optional().isNumeric().withMessage('Cost price must be a number')
    ]),
    updatePrice
  )
  .delete(
    protect,
    authorize('manager'),
    validate([
      param('id').isMongoId().withMessage('Invalid price ID')
    ]),
    deactivatePrice
  );

module.exports = router;
