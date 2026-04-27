const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./config/db');
const { protect, adminOnly } = require('./middleware/authMiddleware');

// Import all routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const frontendPath = path.join(__dirname, '..', 'frontend');

const corsOrigin = process.env.CORS_ORIGIN || '*';
const allowedOrigins = corsOrigin === '*'
  ? true
  : corsOrigin.split(',').map((origin) => origin.trim());

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.static(frontendPath));

// Connect routes to the app
// All auth routes start with /api/auth
// All product routes start with /api/products
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Base route
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('/api', (req, res) => {
  res.json({ message: 'ShopEase API is running! 🛒' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// DB health check route
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 AS ok');
    res.json({
      message: 'Database connection is working',
      result: rows[0]
    });
  } catch (error) {
    res.status(500).json({
      message: 'Database connection failed',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;
// Admin stats route
app.get('/api/admin/stats', protect, adminOnly, async (req, res) => {
  try {
    const [[{totalProducts}]] = await db.query(
      'SELECT COUNT(*) as totalProducts FROM products'
    );
    const [[{totalOrders}]] = await db.query(
      'SELECT COUNT(*) as totalOrders FROM orders'
    );
    const [[{totalUsers}]] = await db.query(
      'SELECT COUNT(*) as totalUsers FROM users'
    );
    const [[{totalRevenue}]] = await db.query(
      'SELECT COALESCE(SUM(total_price),0) as totalRevenue FROM orders'
    );
    res.json({ totalProducts, totalOrders, totalUsers, totalRevenue });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});