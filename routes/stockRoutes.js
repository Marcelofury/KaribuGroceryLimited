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

/**
 * @swagger
 * /api/stock:
 *   get:
 *     summary: Get all stock for user's branch (or all for director)
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create or update stock (Manager only)
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 */
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

/**
 * @swagger
 * /api/stock/product/{productId}:
 *   get:
 *     summary: Get stock for a specific product
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/product/:productId',
  protect,
  validate([
    param('productId').isMongoId().withMessage('Invalid product ID')
  ]),
  getStockByProduct
);

/**
 * @swagger
 * /api/stock/{id}:
 *   put:
 *     summary: Update stock quantity or reorder level (Manager only)
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 */
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

/**
 * @swagger
 * /api/stock/decrease/{id}:
 *   put:
 *     summary: Decrease stock quantity (for sales)
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 */
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
