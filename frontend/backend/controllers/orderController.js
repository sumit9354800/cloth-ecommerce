const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin
const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('orderItems.product', 'name price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments();

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Orders fetch nahi ho paaye',
      error: error.message,
    });
  }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders/my-orders
const getMyOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.product', 'name price images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments({ user: req.user._id });

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Your orders fetch nahi ho paaye',
      error: error.message,
    });
  }
};

// @desc    Get single order details
// @route   GET /api/orders/:id
const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('orderItems.product', 'name price images category');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order nahi mila',
      });
    }

    // Check user authorization (user can see own order, admin can see all)
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Aap ye order nahi dekh sakte',
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Order details fetch nahi ho paaye',
      error: error.message,
    });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, courierName } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order nahi mila',
      });
    }

    // Agar order delivered hai toh deliveredAt set karo
    if (status === 'Delivered') {
      order.deliveredAt = Date.now();
      order.trackingNumber = trackingNumber || order.trackingNumber;
      order.courierName = courierName || order.courierName;
    }

    // Agar order cancelled hai toh stock wapas badhao
    if (status === 'Cancelled' && order.orderStatus !== 'Cancelled') {
      order.cancelledAt = Date.now();
      
      // Restore stock
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    order.orderStatus = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (courierName) order.courierName = courierName;

    await order.save();

    res.status(200).json({
      success: true,
      order,
      message: `Order status updated to ${status}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Order status update nahi ho paaya',
      error: error.message,
    });
  }
};

// @desc    Cancel order (User can cancel their own order)
// @route   PUT /api/orders/:id/cancel
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order nahi mila',
      });
    }

    // Check if order belongs to user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Aap ye order cancel nahi kar sakte',
      });
    }

    // Only processing orders can be cancelled
    if (!['Processing', 'Confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Ye order cancel nahi ho sakta, already processed hai',
      });
    }

    order.orderStatus = 'Cancelled';
    order.cancelledAt = Date.now();

    // Restore stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    await order.save();

    res.status(200).json({
      success: true,
      order,
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Order cancel nahi ho paaya',
      error: error.message,
    });
  }
};

module.exports = {
  getAllOrders,
  getMyOrders,
  getOrderDetails,
  updateOrderStatus,
  cancelOrder,
};