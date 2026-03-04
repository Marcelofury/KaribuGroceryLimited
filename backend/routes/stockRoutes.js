const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { body, param } = require('express-validator');
const {
  getStock,
  getStockByProduct,
  createOrUpdateStock,
  updateStock,
  decreaseStock
} = require('../controllers/stockController');

router.route('/')
  .get(protect, getStock)
  .post(
    protect,
    authorize('manager'),
    validate([
      body('product').isMongoId().withMessage('Invalid product ID'),
      body('branch').isIn(['Maganjo', 'Matugga']).withMessage('Invalid branch'),
      body('quantity').isNumeric().withMessage('Quantity must be a number'),
      body('reorderLevel').optional().isNumeric().withMessage('Reorder level must be a number')
    ]),
    createOrUpdateStock
  );

router.get(
  '/product/:productId',
  protect,
  validate([
    param('productId').isMongoId().withMessage('Invalid product ID')
  ]),
  getStockByProduct
);

router.put(
  '/:id',
  protect,
  authorize('manager'),
  validate([
    param('id').isMongoId().withMessage('Invalid stock ID'),
    body('quantity').optional().isNumeric().withMessage('Quantity must be a number'),
    body('reorderLevel').optional().isNumeric().withMessage('Reorder level must be a number')
  ]),
  updateStock
);

router.put(
  '/decrease/:id',
  protect,
  authorize('sales-agent', 'manager'),
  validate([
    param('id').isMongoId().withMessage('Invalid stock ID'),
    body('quantity').isNumeric().withMessage('Quantity must be a number')
  ]),
  decreaseStock
);

module.exports = router;
