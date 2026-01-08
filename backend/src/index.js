// backend/src/index.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const pool = require('./config/db'); // PostgreSQL pool

// Routes
const testRoutes = require('./routes/testRoutes.js'); // test routes
const OrderController = require('./controllers/OrderController');
const PaymentController = require('./controllers/PaymentController');
const DashboardController = require('./controllers/DashboardController');
const HealthController = require('./controllers/HealthController');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(bodyParser.json());
app.use(cors()); // if frontend on another port
app.use('/api/v1/test', testRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('Payment Gateway Backend is running!');
});

// API Routes
app.use('/api/v1/orders', OrderController);
app.use('/api/v1/payments', PaymentController);
app.use('/api/v1/dashboard', DashboardController);
app.use('/api/v1/health', HealthController);

// Global error handler
app.use((err, req, res, next) => {
  console.error('GLOBAL ERROR:', err);
  res.status(500).json({ error: { code: 'SERVER_ERROR', description: err.message } });
});

// Start server after DB connection
(async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL database');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to PostgreSQL:', err);
    process.exit(1);
  }
})();
