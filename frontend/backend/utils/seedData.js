const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

dotenv.config();

const products = [
  {
    name: 'Classic White T-Shirt',
    description: 'Premium cotton classic fit white t-shirt. Perfect for casual wear. Made from 100% organic cotton for ultimate comfort.',
    price: 999,
    category: 'Men',
    stock: 50,
    size: ['S', 'M', 'L', 'XL', 'XXL'],
    color: ['White', 'Black', 'Gray'],
    ratings: 4.5,
    images: [{ public_id: 'sample1', url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500' }]
  },
  {
    name: 'Slim Fit Jeans',
    description: 'Modern slim fit jeans with stretchable fabric. Trendy design for everyday style.',
    price: 2499,
    category: 'Men',
    stock: 30,
    size: ['28', '30', '32', '34', '36'],
    color: ['Blue', 'Black', 'Gray'],
    ratings: 4.2,
    images: [{ public_id: 'sample2', url: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=500' }]
  },
  {
    name: 'Floral Print Dress',
    description: 'Beautiful floral print summer dress with elegant design. Perfect for parties and casual outings.',
    price: 1999,
    category: 'Women',
    stock: 25,
    size: ['XS', 'S', 'M', 'L', 'XL'],
    color: ['Pink', 'White', 'Yellow'],
    ratings: 4.7,
    images: [{ public_id: 'sample3', url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500' }]
  },
  {
    name: 'Leather Jacket',
    description: 'Premium genuine leather jacket with quilted lining. Classic biker style for a bold look.',
    price: 5999,
    category: 'Men',
    stock: 15,
    size: ['M', 'L', 'XL'],
    color: ['Black', 'Brown'],
    ratings: 4.8,
    images: [{ public_id: 'sample4', url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500' }]
  },
  {
    name: 'Running Shoes',
    description: 'Lightweight running shoes with responsive cushioning. Breathable mesh upper for comfort.',
    price: 3499,
    category: 'Shoes',
    stock: 40,
    size: ['6', '7', '8', '9', '10', '11'],
    color: ['Black', 'White', 'Red', 'Blue'],
    ratings: 4.4,
    images: [{ public_id: 'sample5', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500' }]
  },
  {
    name: 'Kids Cartoon T-Shirt',
    description: 'Fun cartoon print t-shirt for kids. Soft cotton fabric for sensitive skin.',
    price: 599,
    category: 'Kids',
    stock: 60,
    size: ['2-3Y', '3-4Y', '5-6Y', '7-8Y'],
    color: ['Yellow', 'Blue', 'Pink', 'Green'],
    ratings: 4.6,
    images: [{ public_id: 'sample6', url: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=500' }]
  },
  {
    name: 'Designer Handbag',
    description: 'Elegant designer handbag with multiple compartments. Premium faux leather with gold hardware.',
    price: 4499,
    category: 'Accessories',
    stock: 20,
    color: ['Black', 'Brown', 'Beige', 'Red'],
    ratings: 4.3,
    images: [{ public_id: 'sample7', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500' }]
  },
  {
    name: 'Formal Blazer',
    description: 'Tailored fit formal blazer for professional look. Perfect for office and business meetings.',
    price: 4999,
    category: 'Men',
    stock: 12,
    size: ['38', '40', '42', '44', '46'],
    color: ['Navy Blue', 'Black', 'Gray'],
    ratings: 4.5,
    images: [{ public_id: 'sample8', url: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=500' }]
  },
  {
    name: 'Ethnic Kurti',
    description: 'Beautiful embroidered kurti for festive occasions. Premium cotton silk blend fabric.',
    price: 1499,
    category: 'Women',
    stock: 35,
    size: ['S', 'M', 'L', 'XL', 'XXL'],
    color: ['Red', 'Green', 'Blue', 'Yellow'],
    ratings: 4.6,
    images: [{ public_id: 'sample9', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500' }]
  },
  {
    name: 'Smart Watch',
    description: 'Feature-rich smartwatch with heart rate monitor and activity tracking. Water resistant design.',
    price: 8999,
    category: 'Accessories',
    stock: 18,
    color: ['Black', 'Silver', 'Gold', 'Blue'],
    ratings: 4.7,
    images: [{ public_id: 'sample10', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500' }]
  },
  {
    name: 'Casual Sneakers',
    description: 'Trendy casual sneakers with memory foam insole. Perfect for everyday wear.',
    price: 2499,
    category: 'Shoes',
    stock: 45,
    size: ['6', '7', '8', '9', '10', '11', '12'],
    color: ['White', 'Black', 'Navy', 'Gray'],
    ratings: 4.3,
    images: [{ public_id: 'sample11', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500' }]
  },
  {
    name: 'Winter Sweater',
    description: 'Warm and cozy wool blend sweater. Classic crew neck design for winter fashion.',
    price: 1899,
    category: 'Women',
    stock: 28,
    size: ['S', 'M', 'L', 'XL'],
    color: ['Cream', 'Gray', 'Burgundy', 'Green'],
    ratings: 4.4,
    images: [{ public_id: 'sample12', url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500' }]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');
    
    // Delete existing products
    await Product.deleteMany({});
    console.log('Existing products deleted');
    
    // Insert new products
    await Product.insertMany(products);
    console.log(`${products.length} products inserted successfully! ✅`);
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();