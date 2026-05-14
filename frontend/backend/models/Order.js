const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  orderItems: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity kam se kam 1 honi chahiye'],
      },
      price: {
        type: Number,
        required: true,
      },
      size: String,
      color: String,
      image: String,
    },
  ],
  shippingAddress: {
    fullName: {
      type: String,
      required: [true, 'Full name likhna zaroori hai'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number likhna zaroori hai'],
      match: [/^[6-9]\d{9}$/, 'Sahi phone number likho'],
    },
    address: {
      type: String,
      required: [true, 'Address likhna zaroori hai'],
    },
    city: {
      type: String,
      required: [true, 'City likhna zaroori hai'],
    },
    state: {
      type: String,
      required: [true, 'State likhna zaroori hai'],
    },
    pincode: {
      type: String,
      required: [true, 'Pincode likhna zaroori hai'],
      match: [/^\d{6}$/, 'Sahi pincode likho (6 digits)'],
    },
    landmark: String,
  },
  paymentInfo: {
    id: String,              // Razorpay payment ID
    status: String,          // Payment status
    method: {
      type: String,
      enum: ['COD', 'ONLINE'],
      default: 'COD',
    },
    paidAt: Date,
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  deliveredAt: Date,
  cancelledAt: Date,
  cancellationReason: String,
  orderNotes: String,
  trackingNumber: String,
  orderId: {
    type: String,
    // unique: true,
  },
}, {
  timestamps: true,
});

// Order ID generate karne ka pre-save hook
orderSchema.pre('save', async function(next) {
  if (!this.orderId) {
    // Format: ORD-20240101-XXXXX
    const date = new Date();
    const dateStr = date.getFullYear() +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0');
    
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.orderId = `ORD-${dateStr}-${randomStr}`;
  }
  next();
});

// Auto-calculate prices before save
orderSchema.pre('save', function(next) {
  // Calculate items total
  this.itemsPrice = this.orderItems.reduce(
    (total, item) => total + (item.price * item.quantity), 0
  );
  
  // Calculate tax (5% GST)
  this.taxPrice = Math.round(this.itemsPrice * 0.05);
  
  // Free shipping above 999
  this.shippingPrice = this.itemsPrice >= 999 ? 0 : 99;
  
  // Calculate total
  this.totalPrice = this.itemsPrice + this.taxPrice + this.shippingPrice;
  
  next();
});

// Indexes for faster queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ orderStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);