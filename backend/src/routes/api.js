const express = require('express');
const router = express.Router();

// ✅ CORRECT PATH (../controllers)
const { createOrder, getOrder } = require('./controllers/OrderController');
const { createPayment, getPayment } = require('./controllers/PaymentController');

// Order routes
router.post('/orders', createOrder);
router.get('/orders/:id', getOrder);

// Payment routes
router.post('/payments', createPayment);
router.get('/payments/:id', getPayment);

module.exports = router;
