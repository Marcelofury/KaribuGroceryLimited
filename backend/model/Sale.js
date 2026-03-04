const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0.01, 'Quantity must be greater than 0']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  totalPrice: {
    type: Number
  }
}, { _id: false });

const saleSchema = new mongoose.Schema({
  saleNumber: {
    type: String,
    unique: true
  },
  branch: {
    type: String,
    required: [true, 'Branch is required'],
    enum: {
      values: ['Maganjo', 'Matugga'],
      message: 'Branch must be either Maganjo or Matugga'
    }
  },
  salesAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sales agent is required']
  },
  items: {
    type: [saleItemSchema],
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: 'At least one item is required'
    }
  },
  totalAmount: {
    type: Number,
    min: [0, 'Total amount cannot be negative']
  },
  paymentMethod: {
    type: String,
    enum: {
      values: ['cash', 'mobile-money', 'bank-transfer'],
      message: 'Invalid payment method'
    },
    default: 'cash'
  },
  customerName: {
    type: String,
    trim: true
  },
  customerPhone: {
    type: String,
    match: [/^(\+256|0)[0-9]{9}$/, 'Invalid phone number format']
  },
  isCreditSale: {
    type: Boolean,
    default: false
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['paid', 'pending', 'partial'],
      message: 'Invalid payment status'
    },
    default: 'paid'
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: [0, 'Amount paid cannot be negative']
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Generate sale number before saving
saleSchema.pre('save', async function(next) {
  if (!this.isNew) {
    return next();
  }

  try {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Format: SALE-YYYYMMDD-XXX
    const prefix = `SALE-${year}${month}${day}`;
    
    // Find the last sale number for today
    const lastSale = await this.constructor.findOne({
      saleNumber: new RegExp(`^${prefix}`)
    }).sort({ saleNumber: -1 });

    let sequence = 1;
    if (lastSale) {
      const lastSequence = parseInt(lastSale.saleNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    this.saleNumber = `${prefix}-${String(sequence).padStart(3, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

// Calculate total amount before saving
saleSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce((sum, item) => {
      item.totalPrice = item.quantity * item.unitPrice;
      return sum + item.totalPrice;
    }, 0);
  }
  next();
});

// Indexes for faster queries
// Note: 'saleNumber' index is automatically created by unique: true
saleSchema.index({ branch: 1, createdAt: -1 });
saleSchema.index({ salesAgent: 1, createdAt: -1 });
saleSchema.index({ paymentStatus: 1 });
saleSchema.index({ isCreditSale: 1 });

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;
