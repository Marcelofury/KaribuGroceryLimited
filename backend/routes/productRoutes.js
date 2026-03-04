const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { body, param } = require('express-validator');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

router.route('/')
  .get(protect, getProducts)
  .post(
    protect,
    authorize('manager'),
    validate([
      body('name').trim().notEmpty().withMessage('Product name is required'),
      body('category').isIn(['Grain', 'Legume', 'Other']).withMessage('Invalid category'),
      body('unit').isIn(['kg', 'ton', 'bag']).withMessage('Invalid unit')
    ]),
    createProduct
  );

router.route('/:id')
  .get(
    protect,
    validate([
      param('id').isMongoId().withMessage('Invalid product ID')
    ]),
    getProduct
  )
  .put(
    protect,
    authorize('manager'),
    validate([
      param('id').isMongoId().withMessage('Invalid product ID')
    ]),
    updateProduct
  )
  .delete(
    protect,
    authorize('manager'),
    validate([
      param('id').isMongoId().withMessage('Invalid product ID')
    ]),
    deleteProduct
  );

module.exports = router;
