const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long']
  },
  nationalId: {
    type: String,
    required: [true, 'National ID is required'],
    unique: true,
    match: [/^[A-Z]{2}[0-9]{14}$/, 'Invalid NIN format']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^(\+256|0)[0-9]{9}$/, 'Invalid phone number format']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't return password by default
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['director', 'manager', 'sales-agent'],
      message: 'Role must be either director, manager or sales-agent'
    }
  },
  branch: {
    type: String,
    required: function() {
      return this.role !== 'director';
    },
    enum: {
      values: ['Maganjo', 'Matugga'],
      message: 'Branch must be either Maganjo or Matugga'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to get user without sensitive info
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

// Check branch capacity before saving
userSchema.pre('save', async function(next) {
  if (!this.isNew) {
    return next();
  }

  try {
    const User = this.constructor;
    
    // Capacity rules
    const maxDirectors = 1;
    const maxManagers = 1;
    const maxSalesAgents = 2;

    // Check director capacity (only 1 director total)
    if (this.role === 'director') {
      const directorCount = await User.countDocuments({ role: 'director' });
      if (directorCount >= maxDirectors) {
        throw new Error('System already has a director');
      }
    }

    // Check manager capacity per branch
    if (this.role === 'manager') {
      const count = await User.countDocuments({
        role: 'manager',
        branch: this.branch
      });
      if (count >= maxManagers) {
        throw new Error(`${this.branch} branch already has ${maxManagers} manager(s)`);
      }
    }

    // Check sales agent capacity per branch
    if (this.role === 'sales-agent') {
      const count = await User.countDocuments({
        role: 'sales-agent',
        branch: this.branch
      });
      if (count >= maxSalesAgents) {
        throw new Error(`${this.branch} branch already has ${maxSalesAgents} sales agent(s)`);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
