const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

// @desc    Create new order
// @route   POST /api/orders
const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      orderNotes,
    } = req.body;

    // Validation: Check if order has items
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order mein koi items nahi hai',
      });
    }

    // Check stock and get current prices
    const validatedItems = [];
    let itemsPrice = 0;

    for (const item of orderItems) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product "${item.name}" ab available nahi hai`,
        });
      }

      // Stock check
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} ka sirf ${product.stock} items stock mein hai`,
        });
      }

      validatedItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price, // Current price from DB
        size: item.size,
        color: item.color,
        image: product.images?.[0]?.url || '',
      });

      itemsPrice += product.price * item.quantity;
    }

    // Create order
    const order = await Order.create({
      user: req.user._id,
      orderItems: validatedItems,
      shippingAddress,
      paymentInfo: {
        method: paymentMethod || 'COD',
      },
      itemsPrice,
      orderNotes,
    });

    // Update product stock
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }, // Stock decrease karo
      });
    }

    // Clear user's cart after successful order
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [], totalItems: 0, totalPrice: 0 }
    );

    // Populate product details in response
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email');

    res.status(201).json({
      success: true,
      order: populatedOrder,
      message: 'Order successfully place ho gaya! 🎉',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Order create nahi ho paaya',
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

    // Filter by status if provided
    const filter = { user: req.user._id };
    if (req.query.status) {
      filter.orderStatus = req.query.status;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email');

    const totalOrders = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasMore: skip + orders.length < totalOrders,
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

// @desc    Get single order details
// @route   GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order nahi mila',
      });
    }

    // Check order ownership (normal user apna hi order dekh sakta hai)
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Aap is order ko access nahi kar sakte',
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

// @desc    Cancel order (Only if not shipped)
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

    // Check ownership
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Aap ye order cancel nahi kar sakte',
      });
    }

    // Can only cancel if status is Pending or Confirmed
    if (!['Pending', 'Confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order "${order.orderStatus}" status mein hai, cancel nahi ho sakta`,
      });
    }

    // Restore product stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    order.orderStatus = 'Cancelled';
    order.cancelledAt = Date.now();
    order.cancellationReason = req.body.reason || 'Customer requested cancellation';
    await order.save();

    res.status(200).json({
      success: true,
      order,
      message: 'Order cancel ho gaya ✅',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Order cancel nahi ho paaya',
      error: error.message,
    });
  }
};

// @desc    Get order by orderId (for tracking without login - public)
// @route   GET /api/orders/track/:orderId
const trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .select('orderId orderStatus orderItems totalPrice createdAt deliveredAt');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Invalid Order ID. Order nahi mila.',
      });
    }

    res.status(200).json({
      success: true,
      order: {
        orderId: order.orderId,
        status: order.orderStatus,
        items: order.orderItems.length,
        total: order.totalPrice,
        orderDate: order.createdAt,
        deliveredDate: order.deliveredAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Order track nahi ho paaya',
      error: error.message,
    });
  }
};

// ADMIN CONTROLLERS

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) {
      filter.orderStatus = req.query.status;
    }
    if (req.query.search) {
      filter.$or = [
        { orderId: { $regex: req.query.search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(filter);

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

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/admin/:id
const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order nahi mila',
      });
    }

    // If delivered, set deliveredAt
    if (status === 'Delivered') {
      order.deliveredAt = Date.now();
    }

    // If shipped, set tracking number
    if (status === 'Shipped' && trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    order.orderStatus = status;
    await order.save();

    res.status(200).json({
      success: true,
      order,
      message: `Order status "${status}" update ho gaya ✅`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Order status update nahi ho paaya',
      error: error.message,
    });
  }
};

// @desc    Get order stats (Admin dashboard)
// @route   GET /api/orders/admin/stats
const getOrderStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const stats = await Promise.all([
      // Total orders
      Order.countDocuments(),
      
      // Today's orders
      Order.countDocuments({ createdAt: { $gte: today } }),
      
      // This month's orders
      Order.countDocuments({ createdAt: { $gte: thisMonth } }),
      
      // Total revenue
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      
      // Today's revenue
      Order.aggregate([
        { $match: { createdAt: { $gte: today }, orderStatus: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      
      // Orders by status
      Order.aggregate([
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalOrders: stats[0],
        todayOrders: stats[1],
        thisMonthOrders: stats[2],
        totalRevenue: stats[3][0]?.total || 0,
        todayRevenue: stats[4][0]?.total || 0,
        ordersByStatus: stats[5],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Stats fetch nahi ho paaye',
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  trackOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
};