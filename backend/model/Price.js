const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  branch: {
    type: String,
    required: false, // Made optional - prices are now shared across branches
    enum: {
      values: ['Maganjo', 'Matugga', null],
      message: 'Branch must be either Maganjo, Matugga, or null for shared pricing'
    }
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: [0, 'Selling price cannot be negative']
  },
  costPrice: {
    type: Number,
    required: [true, 'Cost price is required'],
    min: [0, 'Cost price cannot be negative']
  },
  effectiveDate: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for unique active price per product (shared across branches)
priceSchema.index({ product: 1, isActive: 1 });
priceSchema.index({ effectiveDate: -1 });

// Virtual for profit margin
priceSchema.virtual('profitMargin').get(function() {
  if (this.costPrice === 0) return 0;
  return ((this.sellingPrice - this.costPrice) / this.costPrice) * 100;
});

// Ensure virtuals are included in JSON
priceSchema.set('toJSON', { virtuals: true });
priceSchema.set('toObject', { virtuals: true });

// Deactivate previous prices when a new one is set
priceSchema.pre('save', async function(next) {
  if (!this.isNew) {
    return next();
  }

  try {
    // Deactivate all previous prices for this product (shared across branches)
    await this.constructor.updateMany({
      product: this.product,
      isActive: true,
      _id: { $ne: this._id }
    }, {
      $set: { isActive: false }
    });

    next();
  } catch (error) {
    next(error);
  }
});

const Price = mongoose.model('Price', priceSchema);

module.exports = Price;
