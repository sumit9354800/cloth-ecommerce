
const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  logout,
  getProfile,
} = require('../controllers/authController');
const User = require('../models/User');
const { authMiddleware,adminMiddleware } = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.get('/profile', authMiddleware, getProfile);
// Sabse neeche ye route add karo (admin only)
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Users fetch nahi ho paaye',
    });
  }
});

module.exports = router;

