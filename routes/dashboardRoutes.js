const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getSalesTrends,
  getTopProducts,
  getBranchComparison
} = require('../controllers/dashboardController');

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics (role-based)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', protect, getDashboardStats);

/**
 * @swagger
 * /api/dashboard/sales-trends:
 *   get:
 *     summary: Get sales trends over time
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/sales-trends', protect, getSalesTrends);

/**
 * @swagger
 * /api/dashboard/top-products:
 *   get:
 *     summary: Get top selling products
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/top-products', protect, getTopProducts);

/**
 * @swagger
 * /api/dashboard/branch-comparison:
 *   get:
 *     summary: Branch comparison (Disabled for directors)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/branch-comparison', protect, getBranchComparison);

module.exports = router;
