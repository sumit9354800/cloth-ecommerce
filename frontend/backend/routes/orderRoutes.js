const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getMyOrders,
  getOrderDetails,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// User routes
router.get('/my-orders', authMiddleware, getMyOrders);
router.get('/:id', authMiddleware, getOrderDetails);
router.put('/:id/cancel', authMiddleware, cancelOrder);

// Admin routes
router.get('/admin/all', authMiddleware, adminMiddleware, getAllOrders);
router.put('/:id/status', authMiddleware, adminMiddleware, updateOrderStatus);

module.exports = router;