const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getSalesTrends,
  getTopProducts,
  getBranchComparison
} = require('../controllers/dashboardController');

router.get('/stats', protect, getDashboardStats);

router.get('/sales-trends', protect, getSalesTrends);

router.get('/top-products', protect, getTopProducts);

router.get('/branch-comparison', protect, getBranchComparison);

module.exports = router;
