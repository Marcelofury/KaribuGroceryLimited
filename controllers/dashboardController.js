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
      const activeUsers = await User.countDocuments({ isActive: true });
      const totalProducts = await Product.countDocuments({ isActive: true });
      
      const totalSales = await Sale.countDocuments();
      const revenueData = await Sale.aggregate([
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);

      return res.status(200).json({
        success: true,
        data: {
          activeUsers,
          totalProducts,
          totalSales,
          totalRevenue: revenueData[0]?.total || 0
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
    const { limit = 10 } = req.query;
    
    const filter = {};

    // Role-based filtering
    if (req.user.role === 'sales-agent') {
      filter.salesAgent = req.user._id;
      filter.branch = req.user.branch;
    } else if (req.user.role === 'manager') {
      filter.branch = req.user.branch;
    }
    // Director sees all branches (no filter)

    const topProducts = await Sale.aggregate([
      { $match: filter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.totalPrice' },
          salesCount: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productData'
        }
      },
      { $unwind: { path: '$productData', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          name: '$productData.name',
          totalQuantity: 1,
          revenue: 1,
          salesCount: 1,
          profitMargin: 15, // Default 15% until we calculate actual
          trend: 'up',
          trendPercentage: 10
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: topProducts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get branch comparison (Director only)
// @route   GET /api/dashboard/branch-comparison
// @access  Private (Director only)
exports.getBranchComparison = async (req, res, next) => {
  try {
    // Only directors can compare branches
    if (req.user.role !== 'director') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This feature is available only to directors.'
      });
    }

    // Get branch performance data
    const branches = ['Maganjo', 'Matugga'];
    const branchData = [];

    for (const branch of branches) {
      // Get branch manager
      const manager = await User.findOne({ role: 'manager', branch, isActive: true })
        .select('fullName');

      // Get sales for this branch
      const salesStats = await Sale.aggregate([
        { $match: { branch } },
        {
          $group: {
            _id: null,
            totalSales: { $sum: 1 },
            revenue: { $sum: '$totalAmount' }
          }
        }
      ]);

      // Get stock value for this branch
      const stockStats = await Stock.aggregate([
        { $match: { branch } },
        {
          $lookup: {
            from: 'prices',
            let: { productId: '$product', branchName: '$branch' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$product', '$$productId'] },
                      { $eq: ['$branch', '$$branchName'] },
                      { $eq: ['$isActive', true] }
                    ]
                  }
                }
              }
            ],
            as: 'priceData'
          }
        },
        {
          $group: {
            _id: null,
            stockValue: {
              $sum: {
                $multiply: [
                  '$quantity',
                  { $ifNull: [{ $arrayElemAt: ['$priceData.costPrice', 0] }, 0] }
                ]
              }
            }
          }
        }
      ]);

      const revenue = salesStats[0]?.revenue || 0;
      const stockValue = stockStats[0]?.stockValue || 0;
      const target = 50000000; // 50M target per branch
      const achievementRate = target > 0 ? ((revenue / target) * 100).toFixed(1) : 0;
      const profitMargin = revenue > 0 ? ((revenue - stockValue) / revenue * 100).toFixed(1) : 0;

      branchData.push({
        branch,
        manager: manager?.fullName || 'Not Assigned',
        revenue,
        target,
        achievementRate: parseFloat(achievementRate),
        stockValue,
        profitMargin: parseFloat(profitMargin)
      });
    }

    res.status(200).json({
      success: true,
      data: branchData
    });
  } catch (error) {
    next(error);
  }
};
