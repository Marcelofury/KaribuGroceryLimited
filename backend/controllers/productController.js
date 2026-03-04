const Product = require('../model/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
exports.getProducts = async (req, res, next) => {
  try {
    const { isActive, category } = req.query;
    const filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Manager only)
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Product with this name already exists'
      });
    }
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Manager only)
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Private (Manager only)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deactivated successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
};
