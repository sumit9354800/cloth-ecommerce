const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  paymentFailed,
  getPaymentKey,
} = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware); // All payment routes need login

router.get('/key', getPaymentKey);
router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.post('/failed', paymentFailed);

module.exports = router;