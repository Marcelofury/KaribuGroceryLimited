const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    uppercase: true
  },
  variety: {
    type: String,
    required: false,
    trim: true,
    uppercase: true,
    minlength: [2, 'Variety must be at least 2 characters']
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
productSchema.index({ name: 1, variety: 1 }, { unique: true });
productSchema.index({ isActive: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
