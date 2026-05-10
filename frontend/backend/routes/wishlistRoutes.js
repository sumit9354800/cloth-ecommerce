const express = require('express');
const router = express.Router();
const {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
} = require('../controllers/wishlistController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All wishlist routes are protected
router.use(authMiddleware);

router.get('/', getWishlist);
router.post('/toggle', toggleWishlist);
router.delete('/remove/:productId', removeFromWishlist);

module.exports = router;