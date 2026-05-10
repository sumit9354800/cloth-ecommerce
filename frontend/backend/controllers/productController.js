const Product = require('../models/Product');

// @desc    Get all products with filters, search, pagination
// @route   GET /api/products
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    // Filter object banayenge
    const queryObj = {};
    
    // Search functionality
    if (req.query.search) {
      queryObj.name = { 
        $regex: req.query.search, 
        $options: 'i' // case insensitive
      };
    }
    
    // Category filter
    if (req.query.category) {
      // Agar comma separated categories aaye toh array banao
      const categories = req.query.category.split(',');
      queryObj.category = { $in: categories };
    }
    
    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      queryObj.price = {};
      if (req.query.minPrice) {
        queryObj.price.$gte = parseInt(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        queryObj.price.$lte = parseInt(req.query.maxPrice);
      }
    }
    
    // Stock filter (available products only)
    if (req.query.inStock === 'true') {
      queryObj.stock = { $gt: 0 };
    }
    
    // Rating filter
    if (req.query.rating) {
      queryObj.ratings = { $gte: parseInt(req.query.rating) };
    }
    
    // Color filter
    if (req.query.color) {
      queryObj.color = { $in: req.query.color.split(',') };
    }
    
    // Size filter
    if (req.query.size) {
      queryObj.size = { $in: req.query.size.split(',') };
    }

    // Sort functionality
    let sortOption = {};
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'price-low':
          sortOption = { price: 1 }; // Ascending
          break;
        case 'price-high':
          sortOption = { price: -1 }; // Descending
          break;
        case 'rating':
          sortOption = { ratings: -1 };
          break;
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        case 'name':
          sortOption = { name: 1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    } else {
      sortOption = { createdAt: -1 }; // Default: newest first
    }

    // Execute query with pagination
    const products = await Product.find(queryObj)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    // Total products count for pagination
    const totalProducts = await Product.countDocuments(queryObj);
    const totalPages = Math.ceil(totalProducts / limit);

    // Get all unique categories, colors, sizes for filters
    const allCategories = await Product.distinct('category');
    const allColors = await Product.distinct('color');
    const allSizes = await Product.distinct('size');
    
    // Price range for slider
    const maxPrice = await Product.findOne().sort('-price').select('price');
    const minPrice = await Product.findOne().sort('price').select('price');

    res.status(200).json({
      success: true,
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit,
      },
      filters: {
        categories: allCategories,
        colors: allColors.flat(),
        sizes: allSizes.flat(),
        priceRange: {
          min: minPrice?.price || 0,
          max: maxPrice?.price || 10000,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Products fetch nahi ho paaye',
      error: error.message,
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product nahi mila',
      });
    }

    // Related products (same category, exclude current product)
    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
    }).limit(4);

    res.status(200).json({
      success: true,
      product,
      relatedProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Product details fetch nahi ho paaye',
      error: error.message,
    });
  }
};

// @desc    Create new product (Admin only)
// @route   POST /api/products
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    
    res.status(201).json({
      success: true,
      product,
      message: 'Product successfully create ho gaya',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Product create nahi ho paaya',
      error: error.message,
    });
  }
};

// @desc    Update product (Admin only)
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product nahi mila',
      });
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      product,
      message: 'Product update ho gaya',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Product update nahi ho paaya',
      error: error.message,
    });
  }
};

// @desc    Delete product (Admin only)
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product nahi mila',
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product delete ho gaya',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Product delete nahi ho paaya',
      error: error.message,
    });
  }
};

// @desc    Get product stats (Admin dashboard ke liye)
// @route   GET /api/products/stats
const getProductStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const outOfStock = await Product.countDocuments({ stock: 0 });
    
    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          totalStock: { $sum: '$stock' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        outOfStock,
        categoryStats,
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
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats,
};