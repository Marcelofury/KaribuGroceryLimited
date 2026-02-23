const Sale = require('../model/Sale');
const Stock = require('../model/Stock');
const Product = require('../model/Product');
const User = require('../model/User');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filter = {};

    // Director gets system-wide overview only
    if (req.user.role === 'director') {
      // Director dashboard - system overview
      const totalUsers = await User.countDocuments({ isActive: true });
      const totalProducts = await Product.countDocuments({ isActive: true });
      const totalBranches = 2; // Maganjo and Matugga
      
      const allSales = await Sale.countDocuments();
      const allRevenue = await Sale.aggregate([
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);

      return res.status(200).json({
        success: true,
        data: {
          systemOverview: {
            totalUsers,
            totalProducts,
            totalBranches,
            totalSales: allSales,
            totalRevenue: allRevenue[0]?.total || 0
          },
          message: 'Director dashboard - System overview'
        }
      });
    }

    // Role-based filtering for managers and sales agents
    if (req.user.role === 'sales-agent') {
      filter.salesAgent = req.user._id;
      filter.branch = req.user.branch;
    } else if (req.user.role === 'manager') {
      filter.branch = req.user.branch;
    }

    // Get sales statistics
    const salesStats = await Sale.aggregate([
      { $match: { ...filter, createdAt: { $gte: today } } },
      {
        $group: {
          _id: null,
          todaySales: { $sum: 1 },
          todayRevenue: { $sum: '$totalAmount' },
          todayPending: {
            $sum: {
              $cond: [
                { $ne: ['$paymentStatus', 'paid'] },
                { $subtract: ['$totalAmount', '$amountPaid'] },
                0
              ]
            }
          }
        }
      }
    ]);

    // Get total sales
    const totalSalesStats = await Sale.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          creditSales: {
            $sum: { $cond: ['$isCreditSale', 1, 0] }
          }
        }
      }
    ]);

    // Get low stock items (only for manager)
    let lowStockCount = 0;
    if (req.user.role === 'manager') {
      const stocks = await Stock.find({ branch: req.user.branch });
      lowStockCount = stocks.filter(stock => stock.isLowStock).length;
    }

    // Get active products count
    const activeProducts = await Product.countDocuments({ isActive: true });

    // Combine statistics
    stats.today = salesStats[0] || { todaySales: 0, todayRevenue: 0, todayPending: 0 };
    stats.overall = totalSalesStats[0] || { totalSales: 0, totalRevenue: 0, creditSales: 0 };
    stats.lowStockCount = lowStockCount;
    stats.activeProducts = activeProducts;

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sales trends (daily/weekly/monthly)
// @route   GET /api/dashboard/sales-trends
// @access  Private
exports.getSalesTrends = async (req, res, next) => {
  try {
    // Director not allowed
    if (req.user.role === 'director') {
      return res.status(403).json({
        success: false,
        message: 'Directors do not have access to sales trends'
      });
    }

    const { period = 'daily', days = 7 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const filter = { createdAt: { $gte: startDate } };

    // Role-based filtering
    if (req.user.role === 'sales-agent') {
      filter.salesAgent = req.user._id;
    } else if (req.user.role === 'manager') {
      filter.branch = req.user.branch;
    }

    let groupBy;
    if (period === 'daily') {
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
    } else if (period === 'weekly') {
      groupBy = {
        year: { $year: '$createdAt' },
        week: { $week: '$createdAt' }
      };
    } else {
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
    }

    const trends = await Sale.aggregate([
      { $match: filter },
      {
        $group: {
          _id: groupBy,
          salesCount: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: trends
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top selling products
// @route   GET /api/dashboard/top-products
// @access  Private
exports.getTopProducts = async (req, res, next) => {
  try {
    // Director not allowed
    if (req.user.role === 'director') {
      return res.status(403).json({
        success: false,
        message: 'Directors do not have access to product sales data'
      });
    }

    const { limit = 5 } = req.query;
    
    const filter = {};

    // Role-based filtering
    if (req.user.role === 'sales-agent') {
      filter.salesAgent = req.user._id;
    } else if (req.user.role === 'manager') {
      filter.branch = req.user.branch;
    }

    const topProducts = await Sale.aggregate([
      { $match: filter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' },
          salesCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' }
    ]);

    res.status(200).json({
      success: true,
      data: topProducts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get branch comparison (Removed - Director has no access)
// @route   GET /api/dashboard/branch-comparison
// @access  Private (Director only)
exports.getBranchComparison = async (req, res, next) => {
  try {
    return res.status(403).json({
      success: false,
      message: 'This feature is not available. Directors have view-only access to their dashboard.'
    });
  } catch (error) {
    next(error);
  }
};
