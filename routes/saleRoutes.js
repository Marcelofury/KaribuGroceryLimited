const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { body, param } = require('express-validator');
const {
  getSales,
  getSale,
  createSale,
  updatePaymentStatus,
  getSalesSummary
} = require('../controllers/saleController');

/**
 * @swagger
 * /api/sales:
 *   get:
 *     summary: Get all sales (filtered by role)
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create a new sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 */
router.route('/')
  .get(protect, getSales)
  .post(
    protect,
    authorize('sales-agent', 'manager'),
    validate([
      body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
      body('items.*.product').isMongoId().withMessage('Invalid product ID'),
      body('items.*.quantity').isNumeric().withMessage('Quantity must be a number'),
      body('items.*.unitPrice').isNumeric().withMessage('Unit price must be a number'),
      body('paymentMethod').optional().isIn(['cash', 'mobile-money', 'bank-transfer']).withMessage('Invalid payment method'),
      body('customerPhone').optional().matches(/^(\+256|0)[0-9]{9}$/).withMessage('Invalid phone number format')
    ]),
    createSale
  );

/**
 * @swagger
 * /api/sales/summary/stats:
 *   get:
 *     summary: Get sales summary statistics
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 */
router.get('/summary/stats', protect, getSalesSummary);

/**
 * @swagger
 * /api/sales/{id}:
 *   get:
 *     summary: Get a single sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id',
  protect,
  validate([
    param('id').isMongoId().withMessage('Invalid sale ID')
  ]),
  getSale
);

/**
 * @swagger
 * /api/sales/{id}/payment:
 *   put:
 *     summary: Update payment status (Manager only)
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/:id/payment',
  protect,
  authorize('manager'),
  validate([
    param('id').isMongoId().withMessage('Invalid sale ID'),
    body('paymentStatus').optional().isIn(['paid', 'pending', 'partial']).withMessage('Invalid payment status'),
    body('amountPaid').optional().isNumeric().withMessage('Amount paid must be a number')
  ]),
  updatePaymentStatus
);

module.exports = router;
