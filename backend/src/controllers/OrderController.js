// backend/src/controllers/OrderController.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const OrderService = require('../models/Order');

/* =====================================================
   AUTHENTICATED ROUTES
===================================================== */

// POST /api/v1/orders
router.post('/', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt = '', notes = {} } = req.body;
    const apiKey = req.headers['x-api-key'];
    const apiSecret = req.headers['x-api-secret'];

    if (!apiKey || !apiSecret)
      return res.status(401).json({
        error: { code: 'AUTHENTICATION_ERROR', description: 'Invalid API credentials' }
      });

    const merchantRes = await pool.query(
      "SELECT * FROM merchants WHERE api_key=$1 AND api_secret=$2 AND is_active=true",
      [apiKey, apiSecret]
    );

    if (!merchantRes.rows.length)
      return res.status(401).json({
        error: { code: 'AUTHENTICATION_ERROR', description: 'Invalid API credentials' }
      });

    const merchant = merchantRes.rows[0];

    if (!amount || amount < 100)
      return res.status(400).json({
        error: { code: 'BAD_REQUEST_ERROR', description: 'Amount must be at least 100' }
      });

    const order = await OrderService.createOrder({ merchant_id: merchant.id, amount, currency, receipt, notes });
    res.status(201).json(order);

  } catch (err) {
    console.error('❌ CREATE ORDER ERROR:', err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', description: 'Something went wrong' } });
  }
});

// GET /api/v1/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const apiKey = req.headers['x-api-key'];
    const apiSecret = req.headers['x-api-secret'];

    if (!apiKey || !apiSecret)
      return res.status(401).json({
        error: { code: 'AUTHENTICATION_ERROR', description: 'Invalid API credentials' }
      });

    const merchantRes = await pool.query(
      "SELECT * FROM merchants WHERE api_key=$1 AND api_secret=$2 AND is_active=true",
      [apiKey, apiSecret]
    );

    if (!merchantRes.rows.length)
      return res.status(401).json({
        error: { code: 'AUTHENTICATION_ERROR', description: 'Invalid API credentials' }
      });

    const merchant = merchantRes.rows[0];
    const order = await OrderService.getOrderById(orderId, merchant.id);

    if (!order)
      return res.status(404).json({
        error: { code: 'NOT_FOUND_ERROR', description: 'Order not found' }
      });

    res.status(200).json(order);

  } catch (err) {
    console.error('❌ GET ORDER ERROR:', err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', description: 'Something went wrong' } });
  }
});

/* =====================================================
   PUBLIC ROUTES (FOR CHECKOUT)
===================================================== */

// GET /api/v1/orders/public/:id
router.get('/public/:id', async (req, res) => {
  try {
    const orderId = req.params.id;

    // Use a public method in OrderService to fetch basic info
    const order = await OrderService.getOrderByIdPublic(orderId);

    if (!order)
      return res.status(404).json({
        error: { code: 'NOT_FOUND_ERROR', description: 'Order not found' }
      });

    // Return only public info for checkout
    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      receipt: order.receipt,
      notes: order.notes
    });

  } catch (err) {
    console.error('❌ GET PUBLIC ORDER ERROR:', err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', description: 'Something went wrong' } });
  }
});

module.exports = router;
