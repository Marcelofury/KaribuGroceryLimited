const Price = require('../model/Price');
const Product = require('../model/Product');

// @desc    Get all active prices
// @route   GET /api/prices
// @access  Private
exports.getPrices = async (req, res, next) => {
  try {
    const { isActive } = req.query;
    const filter = {};

    // Director not allowed
    if (req.user.role === 'director') {
      return res.status(403).json({
        success: false,
        message: 'Directors do not have access to price data'
      });
    }

    filter.branch = req.user.branch;

    // Filter by active status
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    } else {
      filter.isActive = true; // Default to active prices only
    }

    const prices = await Price.find(filter)
      .populate('product', 'name category unit')
      .populate('updatedBy', 'fullName')
      .sort({ 'product.name': 1 });

    res.status(200).json({
      success: true,
      count: prices.length,
      data: prices
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get price for a specific product
// @route   GET /api/prices/product/:productId
// @access  Private
exports.getPriceByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    // Director not allowed
    if (req.user.role === 'director') {
      return res.status(403).json({
        success: false,
        message: 'Directors do not have access to price data'
      });
    }
    
    const filter = {
      product: productId,
      branch: req.user.branch,
      isActive: true
    };

    const price = await Price.findOne(filter)
      .populate('product', 'name category unit')
      .populate('updatedBy', 'fullName');

    if (!price) {
      return res.status(404).json({
        success: false,
        message: 'Price not found for this product'
      });
    }

    res.status(200).json({
      success: true,
      data: price
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get price history for a product
// @route   GET /api/prices/product/:productId/history
// @access  Private (Manager, Director)
exports.getPriceHistory = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { branch } = req.query;

    const filter = { product: productId };

    // Filter by branch
    if (req.user.role === 'manager') {
      filter.branch = req.user.branch;
    } else if (branch) {
      filter.branch = branch;
    }

    const priceHistory = await Price.find(filter)
      .populate('product', 'name category unit')
      .populate('updatedBy', 'fullName')
      .sort({ effectiveDate: -1 });

    res.status(200).json({
      success: true,
      count: priceHistory.length,
      data: priceHistory
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update price
// @route   POST /api/prices
// @access  Private (Manager only)
exports.createPrice = async (req, res, next) => {
  try {
    const { product, branch, sellingPrice, costPrice } = req.body;

    // Verify product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Managers can only set prices for their branch
    if (req.user.role === 'manager' && branch !== req.user.branch) {
      return res.status(403).json({
        success: false,
        message: 'You can only set prices for your branch'
      });
    }

    // Create new price (pre-save hook will deactivate old ones)
    const price = await Price.create({
      product,
      branch,
      sellingPrice,
      costPrice,
      updatedBy: req.user._id
    });

    const populatedPrice = await Price.findById(price._id)
      .populate('product', 'name category unit')
      .populate('updatedBy', 'fullName');

    res.status(201).json({
      success: true,
      data: populatedPrice
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update price
// @route   PUT /api/prices/:id
// @access  Private (Manager only)
exports.updatePrice = async (req, res, next) => {
  try {
    const { sellingPrice, costPrice } = req.body;

    const price = await Price.findById(req.params.id);

    if (!price) {
      return res.status(404).json({
        success: false,
        message: 'Price not found'
      });
    }

    // Check authorization
    if (req.user.role === 'manager' && price.branch !== req.user.branch) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update prices for other branches'
      });
    }

    if (sellingPrice !== undefined) price.sellingPrice = sellingPrice;
    if (costPrice !== undefined) price.costPrice = costPrice;
    price.updatedBy = req.user._id;

    await price.save();

    const updatedPrice = await Price.findById(price._id)
      .populate('product', 'name category unit')
      .populate('updatedBy', 'fullName');

    res.status(200).json({
      success: true,
      data: updatedPrice
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate price
// @route   DELETE /api/prices/:id
// @access  Private (Manager only)
exports.deactivatePrice = async (req, res, next) => {
  try {
    const price = await Price.findById(req.params.id);

    if (!price) {
      return res.status(404).json({
        success: false,
        message: 'Price not found'
      });
    }

    // Check authorization
    if (req.user.role === 'manager' && price.branch !== req.user.branch) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to deactivate prices for other branches'
      });
    }

    price.isActive = false;
    await price.save();

    res.status(200).json({
      success: true,
      message: 'Price deactivated successfully',
      data: price
    });
  } catch (error) {
    next(error);
  }
};
