const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('products', 'name price images stock category ratings');

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [],
      });
    }

    res.status(200).json({
      success: true,
      wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Wishlist fetch nahi ho paayi',
      error: error.message,
    });
  }
};

// @desc    Toggle product in wishlist (Add/Remove)
// @route   POST /api/wishlist/toggle
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product nahi mila',
      });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      // Naya wishlist banao aur product add karo
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [productId],
      });

      return res.status(200).json({
        success: true,
        wishlist,
        message: 'Product wishlist mein add ho gaya ❤️',
        added: true,
      });
    }

    // Check if product already in wishlist
    const productIndex = wishlist.products.indexOf(productId);

    if (productIndex > -1) {
      // Product already hai, remove karo
      wishlist.products.splice(productIndex, 1);
      await wishlist.save();

      return res.status(200).json({
        success: true,
        wishlist,
        message: 'Product wishlist se remove ho gaya 💔',
        added: false,
      });
    } else {
      // Product nahi hai, add karo
      wishlist.products.push(productId);
      await wishlist.save();

      return res.status(200).json({
        success: true,
        wishlist,
        message: 'Product wishlist mein add ho gaya ❤️',
        added: true,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Wishlist toggle nahi ho paayi',
      error: error.message,
    });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/remove/:productId
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist nahi mili',
      });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );

    await wishlist.save();

    res.status(200).json({
      success: true,
      wishlist,
      message: 'Product wishlist se remove ho gaya',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Remove nahi ho paaya',
      error: error.message,
    });
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
};