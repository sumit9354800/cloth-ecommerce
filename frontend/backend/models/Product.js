const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product ka naam likho'],
    trim: true,
    maxLength: [100, 'Naam 100 characters se chhota rakho'],
  },
  description: {
    type: String,
    required: [true, 'Product ke baare mein likho'],
  },
  price: {
    type: Number,
    required: [true, 'Price likho'],
    maxLength: [8, 'Price 8 digits se bada nahi ho sakta'],
  },
  category: {
    type: String,
    required: [true, 'Category select karo'],
    enum: ['Men', 'Women', 'Kids', 'Accessories', 'Shoes'],
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  stock: {
    type: Number,
    required: [true, 'Stock quantity likho'],
    default: 1,
  },
  size: [String],
  color: [String],
  ratings: {
    type: Number,
    default: 0,
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);