const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected...');

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@fashionstore.com' });
    
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
      console.log('Login at: http://localhost:3000/auth/login');
      console.log('Email: admin@fashionstore.com');
      console.log('Password: admin123');
      process.exit(0);
    }

    // Create admin
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@fashionstore.com',
      password: 'admin123',
      role: 'admin',
    });

    console.log('Admin created successfully! ✅');
    console.log('Login at: http://localhost:3000/auth/login');
    console.log('Email: admin@fashionstore.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdmin();