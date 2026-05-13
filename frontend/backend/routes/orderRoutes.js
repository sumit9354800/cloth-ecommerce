const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  trackOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
} = require('../controllers/orderController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Public route (no login required)
router.get('/track/:orderId', trackOrder);

// User routes (login required)
router.use(authMiddleware);
router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

// Admin routes
router.get('/admin/all', adminMiddleware, getAllOrders);
router.get('/admin/stats', adminMiddleware, getOrderStats);
router.put('/admin/:id', adminMiddleware, updateOrderStatus);

module.exports = router;