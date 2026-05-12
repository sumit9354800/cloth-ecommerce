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
      name: String,
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      image: String,
      size: String,
      color: String,
    },
  ],
  
  shippingAddress: {
    fullName: {
      type: String,
      required: [true, 'Full name likhna zaroori hai'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number likhna zaroori hai'],
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
    },
    landmark: String,
  },

  paymentInfo: {
    razorpayOrderId: {
      type: String,
      required: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    method: String,
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
    enum: ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing',
  },

  deliveredAt: Date,
  cancelledAt: Date,

  trackingNumber: String,
  courierName: String,

  notes: String,
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ 'paymentInfo.razorpayOrderId': 1 });

module.exports = mongoose.model('Order', orderSchema);