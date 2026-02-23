const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Grain', 'Legume', 'Other'],
      message: 'Category must be Grain, Legume, or Other'
    }
  },
  unit: {
    type: String,
    required: [true, 'Unit of measurement is required'],
    enum: {
      values: ['kg', 'ton', 'bag'],
      message: 'Unit must be kg, ton, or bag'
    },
    default: 'kg'
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
// Note: 'name' index is automatically created by unique: true
productSchema.index({ isActive: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
