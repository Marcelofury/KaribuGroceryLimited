const Stock = require('../model/Stock');
const Product = require('../model/Product');

// @desc    Get all stock for a branch
// @route   GET /api/stock
// @access  Private
exports.getStock = async (req, res, next) => {
  try {
    const { lowStock } = req.query;
    const filter = {};

    // Filter by user's branch (director not allowed)
    if (req.user.role === 'director') {
      return res.status(403).json({
        success: false,
        message: 'Directors do not have access to stock data'
      });
    }

    filter.branch = req.user.branch;

    const stock = await Stock.find(filter)
      .populate('product', 'name category unit')
      .populate('restockedBy', 'fullName')
      .sort({ 'product.name': 1 });

    // Filter for low stock if requested
    let filteredStock = stock;
    if (lowStock === 'true') {
      filteredStock = stock.filter(item => item.isLowStock);
    }

    res.status(200).json({
      success: true,
      count: filteredStock.length,
      data: filteredStock
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get stock for a specific product
// @route   GET /api/stock/:productId
// @access  Private
exports.getStockByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    // Director not allowed
    if (req.user.role === 'director') {
      return res.status(403).json({
        success: false,
        message: 'Directors do not have access to stock data'
      });
    }

    const filter = { 
      product: productId,
      branch: req.user.branch
    };

    const stock = await Stock.find(filter)
      .populate('product', 'name category unit')
      .populate('restockedBy', 'fullName');

    res.status(200).json({
      success: true,
      count: stock.length,
      data: stock
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update stock (restock or adjust)
// @route   PUT /api/stock/:id
// @access  Private (Manager only)
exports.updateStock = async (req, res, next) => {
  try {
    const { quantity, reorderLevel } = req.body;
    const updateData = { restockedBy: req.user._id };

    if (quantity !== undefined) {
      updateData.quantity = quantity;
      updateData.lastRestocked = Date.now();
    }

    if (reorderLevel !== undefined) {
      updateData.reorderLevel = reorderLevel;
    }

    const stock = await Stock.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).populate('product', 'name category unit');

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: stock
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update stock for a product
// @route   POST /api/stock
// @access  Private (Manager only)
exports.createOrUpdateStock = async (req, res, next) => {
  try {
    const { 
      product, 
      branch, 
      quantity, 
      reorderLevel, 
      supplier, 
      supplierContact, 
      costPrice, 
      sellingPrice, 
      procurementDate, 
      notes 
    } = req.body;

    // Verify product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if stock record exists
    let stock = await Stock.findOne({ product, branch });

    if (stock) {
      // Update existing stock
      stock.quantity = quantity;
      if (reorderLevel !== undefined) stock.reorderLevel = reorderLevel;
      if (supplier) stock.supplier = supplier;
      if (supplierContact) stock.supplierContact = supplierContact;
      if (costPrice !== undefined) stock.costPrice = costPrice;
      if (sellingPrice !== undefined) stock.sellingPrice = sellingPrice;
      if (procurementDate) stock.procurementDate = procurementDate;
      if (notes) stock.notes = notes;
      stock.lastRestocked = Date.now();
      stock.restockedBy = req.user._id;
      await stock.save();
    } else {
      // Create new stock record
      stock = await Stock.create({
        product,
        branch,
        quantity,
        reorderLevel: reorderLevel || 50,
        supplier,
        supplierContact,
        costPrice,
        sellingPrice,
        procurementDate,
        notes,
        lastRestocked: Date.now(),
        restockedBy: req.user._id
      });
    }

    // Populate product details
    stock = await Stock.findById(stock._id)
      .populate('product', 'name category unit')
      .populate('restockedBy', 'fullName');

    res.status(stock.isNew ? 201 : 200).json({
      success: true,
      data: stock
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Decrease stock (used during sales)
// @route   PUT /api/stock/decrease/:id
// @access  Private (Sales Agent, Manager)
exports.decreaseStock = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    const stock = await Stock.findById(req.params.id);

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock record not found'
      });
    }

    if (stock.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${stock.quantity}`
      });
    }

    stock.quantity -= quantity;
    await stock.save();

    const updatedStock = await Stock.findById(stock._id)
      .populate('product', 'name category unit');

    res.status(200).json({
      success: true,
      data: updatedStock
    });
  } catch (error) {
    next(error);
  }
};
