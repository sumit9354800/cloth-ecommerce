// backend/controllers/cartController.js
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user's cart
// @route   GET /api/cart
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name price images stock category',
      });

    // Agar cart exist nahi karta toh empty cart banao
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        totalPrice: 0,
        totalItems: 0,  // ✅ Added
      });
    }

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error('Get cart error:', error);  // ✅ Added logging
    res.status(500).json({
      success: false,
      message: 'Cart fetch nahi ho paaya',
      error: error.message,
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;

    // Product exist karta hai check karo
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product nahi mila',
      });
    }

    // Stock check karo
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`,
      });
    }

    // User ka cart dhundho ya naya banao
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      // Naya cart banao with proper structure
      cart = new Cart({
        user: req.user._id,
        items: [{
          product: productId,
          quantity,
          size,
          color,
          price: product.price,
        }],
        totalPrice: product.price * quantity,
        totalItems: quantity,
      });
      await cart.save();
    } else {
      // Check if product already in cart
      const existingItemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId &&
                  item.size === size &&
                  item.color === color
      );

      if (existingItemIndex > -1) {
        // Product already cart mein hai, quantity update karo
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        
        // Stock se zyada toh nahi
        if (newQuantity > product.stock) {
          return res.status(400).json({
            success: false,
            message: `You can only add up to ${product.stock} items of this product`,
          });
        }
        
        cart.items[existingItemIndex].quantity = newQuantity;
      } else {
        // Naya product add karo
        cart.items.push({
          product: productId,
          quantity,
          size,
          color,
          price: product.price,
        });
      }

      // Update totals manually (or use pre-save hook)
      cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
      cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      await cart.save();
    }

    // Populated cart return karo
    cart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price images stock category',
    });

    res.status(200).json({
      success: true,
      cart,
      message: 'Product cart mein add ho gaya 🛒',
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Cart mein add nahi ho paaya',
      error: error.message,
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity, size, color } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity kam se kam 1 honi chahiye',
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart nahi mila',
      });
    }

    // Find the item
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId &&
                item.size === size &&
                item.color === color
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item cart mein nahi mila',
      });
    }

    // Stock check
    const product = await Product.findById(productId);
    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available`,
      });
    }

    cart.items[itemIndex].quantity = quantity;
    
    // Update totals
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    await cart.save();

    // Populated cart return karo
    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price images stock category',
    });

    res.status(200).json({
      success: true,
      cart: updatedCart,
      message: 'Cart update ho gaya ✅',
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Cart update nahi ho paaya',
      error: error.message,
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const { size, color } = req.query;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart nahi mila',
      });
    }

    // Filter out the item
    cart.items = cart.items.filter(
      (item) => !(item.product.toString() === productId &&
                  item.size === size &&
                  item.color === color)
    );

    // Update totals
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name price images stock category',
    });

    res.status(200).json({
      success: true,
      cart: updatedCart,
      message: 'Item cart se remove ho gaya 🗑️',
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Item remove nahi ho paaya',
      error: error.message,
    });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart/clear
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart nahi mila',
      });
    }

    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;
    
    await cart.save();

    res.status(200).json({
      success: true,
      cart,
      message: 'Cart clear ho gaya 🗑️',
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Cart clear nahi ho paaya',
      error: error.message,
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};