const Sale = require('../model/Sale');
const Stock = require('../model/Stock');
const Product = require('../model/Product');

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
exports.getSales = async (req, res, next) => {
  try {
    const { startDate, endDate, paymentStatus, isCreditSale } = req.query;
    const filter = {};

    // Director not allowed
    if (req.user.role === 'director') {
      return res.status(403).json({
        success: false,
        message: 'Directors do not have access to sales data'
      });
    }

    // Role-based filtering
    if (req.user.role === 'sales-agent') {
      filter.salesAgent = req.user._id;
    } else if (req.user.role === 'manager') {
      filter.branch = req.user.branch;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    // Other filters
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (isCreditSale !== undefined) filter.isCreditSale = isCreditSale === 'true';

    const sales = await Sale.find(filter)
      .populate('salesAgent', 'fullName username')
      .populate('items.product', 'name unit')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sales.length,
      data: sales
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single sale
// @route   GET /api/sales/:id
// @access  Private
exports.getSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('salesAgent', 'fullName username branch')
      .populate('items.product', 'name category unit');

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    // Check authorization
    if (req.user.role === 'sales-agent' && sale.salesAgent._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this sale'
      });
    }

    if (req.user.role === 'manager' && sale.branch !== req.user.branch) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view sales from other branches'
      });
    }

    res.status(200).json({
      success: true,
      data: sale
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new sale
// @route   POST /api/sales
// @access  Private (Sales Agent, Manager)
exports.createSale = async (req, res, next) => {
  try {
    const { items, customerName, customerPhone, paymentMethod, isCreditSale, amountPaid, notes } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required'
      });
    }

    // Verify stock availability and update stock
    for (const item of items) {
      const stock = await Stock.findOne({
        product: item.product,
        branch: req.user.branch
      });

      if (!stock) {
        const product = await Product.findById(item.product);
        return res.status(400).json({
          success: false,
          message: `${product.name} is not available in your branch`
        });
      }

      if (stock.quantity < item.quantity) {
        const product = await Product.findById(item.product);
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${stock.quantity}`
        });
      }
    }

    // Create sale
    const sale = await Sale.create({
      branch: req.user.branch,
      salesAgent: req.user._id,
      items,
      customerName,
      customerPhone,
      paymentMethod,
      isCreditSale: isCreditSale || false,
      paymentStatus: isCreditSale ? 'pending' : 'paid',
      amountPaid: amountPaid || 0,
      notes
    });

    // Update stock quantities
    for (const item of items) {
      await Stock.findOneAndUpdate(
        { product: item.product, branch: req.user.branch },
        { $inc: { quantity: -item.quantity } }
      );
    }

    // Populate and return
    const populatedSale = await Sale.findById(sale._id)
      .populate('salesAgent', 'fullName username')
      .populate('items.product', 'name unit');

    res.status(201).json({
      success: true,
      data: populatedSale
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update sale payment status
// @route   PUT /api/sales/:id/payment
// @access  Private (Manager only)
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus, amountPaid } = req.body;

    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    // Check branch authorization for manager
    if (req.user.role === 'manager' && sale.branch !== req.user.branch) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update sales from other branches'
      });
    }

    if (paymentStatus) sale.paymentStatus = paymentStatus;
    if (amountPaid !== undefined) sale.amountPaid = amountPaid;

    await sale.save();

    const updatedSale = await Sale.findById(sale._id)
      .populate('salesAgent', 'fullName username')
      .populate('items.product', 'name unit');

    res.status(200).json({
      success: true,
      data: updatedSale
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sales summary
// @route   GET /api/sales/summary/stats
// @access  Private
exports.getSalesSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const matchFilter = {};

    // Role-based filtering
    if (req.user.role === 'sales-agent') {
      matchFilter.salesAgent = req.user._id;
    } else if (req.user.role === 'manager') {
      matchFilter.branch = req.user.branch;
    }

    // Date range
    if (startDate || endDate) {
      matchFilter.createdAt = {};
      if (startDate) matchFilter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchFilter.createdAt.$lte = end;
      }
    }

    const summary = await Sale.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$amountPaid' },
          creditSales: {
            $sum: { $cond: ['$isCreditSale', 1, 0] }
          },
          pendingAmount: {
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

    res.status(200).json({
      success: true,
      data: summary[0] || {
        totalSales: 0,
        totalRevenue: 0,
        totalPaid: 0,
        creditSales: 0,
        pendingAmount: 0
      }
    });
  } catch (error) {
    next(error);
  }
};
