const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

// Razorpay instance create karo
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay Order (Payment initiate)
// @route   POST /api/payment/create-order
const createPaymentOrder = async (req, res) => {
  try {
    const { items, shippingAddress, couponDiscount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart mein items nahi hain',
      });
    }

    // Calculate prices
    const itemsPrice = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const taxPrice = Math.round(itemsPrice * 0.18); // 18% GST
    const shippingPrice = itemsPrice > 999 ? 0 : 99;
    const discount = couponDiscount || 0;
    const totalPrice = itemsPrice + taxPrice + shippingPrice - discount;

    // Razorpay order options
    const options = {
      amount: totalPrice * 100, // Razorpay paise mein leta hai (₹500 = 50000 paise)
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        itemsCount: items.length,
      },
    };

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create(options);

    if (!razorpayOrder) {
      return res.status(500).json({
        success: false,
        message: 'Payment order create nahi ho paaya',
      });
    }

    // Create order in our database
    const order = await Order.create({
      user: req.user._id,
      orderItems: items.map(item => ({
        product: item.product || item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.images?.[0]?.url || item.image,
        size: item.selectedSize || item.size,
        color: item.selectedColor || item.color,
      })),
      shippingAddress,
      paymentInfo: {
        razorpayOrderId: razorpayOrder.id,
        status: 'pending',
      },
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    res.status(200).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      orderId: order._id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Payment order error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment initiate nahi ho paaya',
      error: error.message,
    });
  }
};

// @desc    Verify Payment Signature
// @route   POST /api/payment/verify
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    // Signature verify karo
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    const isAuthentic = expectedSign === razorpay_signature;

    if (isAuthentic) {
      // Payment successful
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order nahi mila',
        });
      }

      // Update payment info
      order.paymentInfo.razorpayPaymentId = razorpay_payment_id;
      order.paymentInfo.razorpaySignature = razorpay_signature;
      order.paymentInfo.status = 'completed';
      order.orderStatus = 'Confirmed';

      // Update product stock
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }

      await order.save();

      // Clear user's cart
      await Cart.findOneAndUpdate(
        { user: req.user._id },
        { items: [], totalPrice: 0, totalItems: 0 }
      );

      res.status(200).json({
        success: true,
        message: 'Payment successful! 🎉',
        order,
      });
    } else {
      // Payment failed
      await Order.findByIdAndUpdate(orderId, {
        'paymentInfo.status': 'failed',
        orderStatus: 'Cancelled',
      });

      res.status(400).json({
        success: false,
        message: 'Payment verification failed. Signature mismatch.',
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verify nahi ho paaya',
      error: error.message,
    });
  }
};

// @desc    Payment Failed Handler
// @route   POST /api/payment/failed
const paymentFailed = async (req, res) => {
  try {
    const { orderId, error } = req.body;

    await Order.findByIdAndUpdate(orderId, {
      'paymentInfo.status': 'failed',
      orderStatus: 'Cancelled',
    });

    res.status(200).json({
      success: true,
      message: 'Payment failed recorded',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed payment record nahi ho paaya',
      error: error.message,
    });
  }
};

// @desc    Get Payment Key (for frontend)
// @route   GET /api/payment/key
const getPaymentKey = async (req, res) => {
  res.status(200).json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID,
  });
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  paymentFailed,
  getPaymentKey,
};