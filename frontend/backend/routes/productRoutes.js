const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats,
} = require('../controllers/productController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getProducts);
router.get('/stats', getProductStats);
router.get('/:id', getProductById);

// Protected routes (Admin only)
router.post('/', authMiddleware, adminMiddleware, createProduct);
router.put('/:id', authMiddleware, adminMiddleware, updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);

module.exports = router;