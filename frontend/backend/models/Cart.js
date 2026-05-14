// backend/models/Cart.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  size: {
    type: String,
    default: null
  },
  color: {
    type: String,
    default: null
  },
  price: {
    type: Number,
    required: true
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate totals
cartSchema.pre('save', function(next) {
  try {
    // Calculate total items
    this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Calculate total price
    this.totalPrice = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-update middleware (for findOneAndUpdate operations)
cartSchema.pre('findOneAndUpdate', function(next) {
  this.options.runValidators = true;
  next();
});

module.exports = mongoose.model('Cart', cartSchema);