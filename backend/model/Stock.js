const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  branch: {
    type: String,
    required: [true, 'Branch is required'],
    enum: {
      values: ['Maganjo', 'Matugga'],
      message: 'Branch must be either Maganjo or Matugga'
    }
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  reorderLevel: {
    type: Number,
    default: 50,
    min: [0, 'Reorder level cannot be negative']
  },
  supplier: {
    type: String
  },
  supplierContact: {
    type: String
  },
  costPrice: {
    type: Number,
    min: [0, 'Cost price cannot be negative']
  },
  sellingPrice: {
    type: Number,
    min: [0, 'Selling price cannot be negative']
  },
  procurementDate: {
    type: Date
  },
  notes: {
    type: String
  },
  lastRestocked: {
    type: Date
  },
  restockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound index for unique product per branch
stockSchema.index({ product: 1, branch: 1 }, { unique: true });
stockSchema.index({ branch: 1 });
stockSchema.index({ quantity: 1 });

// Virtual for low stock alert
stockSchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.reorderLevel;
});

// Ensure virtuals are included in JSON
stockSchema.set('toJSON', { virtuals: true });
stockSchema.set('toObject', { virtuals: true });

const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;
