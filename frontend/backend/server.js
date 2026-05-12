const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
// const paymentRoutes = require('./routes/paymentRoutes');
// const orderRoutes = require('./routes/orderRoutes');

// Environment variables load karo
dotenv.config();

// Express app create karo
const app = express();

// Database se connect karo
connectDB();

// Middlewares (Bich mein kaam karne wale functions)
app.use(cors({
  origin: 'http://localhost:3000', // Frontend ka address
  credentials: true, // Cookies allow karo
}));
app.use(express.json()); // JSON data parse karo
app.use(express.urlencoded({ extended: true })); // Form data parse karo
app.use(cookieParser()); // Cookies parse karo

// Basic test route
app.get('/', (req, res) => {
  res.send('Clothing E-Commerce API is running...');
});

// Routes (Baad mein add karenge)
// app.use('/api/auth', authRoutes);

// Import routes
const authRoutes = require('./routes/authRoutes');
// Routes
app.use('/api/auth', authRoutes);

// app.use('/api/products', productRoutes);
// Import routes ke section mein ye line add karo
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

// Routes section mein ye line add karo
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
// app.use('/api/payment', paymentRoutes);
// app.use('/api/orders', orderRoutes);
// Port define karo
const PORT = process.env.PORT || 5000;

// Server start karo
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});