const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const MerchantModel = require('../models/Merchant');
const OrderModel = require('../models/Order');

/* =====================================================
   AUTH MIDDLEWARE
===================================================== */
async function auth(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const apiSecret = req.headers['x-api-secret'];

  if (!apiKey || !apiSecret) {
    return res.status(401).json({
      error: { code: 'AUTHENTICATION_ERROR', description: 'Missing API credentials' },
    });
  }

  try {
    const merchant = await MerchantModel.findByApiKey(apiKey);
    if (!merchant || merchant.api_secret !== apiSecret) {
      return res.status(401).json({
        error: { code: 'AUTHENTICATION_ERROR', description: 'Invalid API credentials' },
      });
    }
    req.merchant = merchant;
    next();
  } catch (err) {
    return res.status(500).json({
      error: { code: 'SERVER_ERROR', description: err.message },
    });
  }
}

/* =====================================================
   PAYMENT VALIDATION HELPERS
===================================================== */
function isValidVPA(vpa) {
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(vpa);
}

function isValidCard(number) {
  const num = number.replace(/\D/g, '');
  if (!/^\d{13,19}$/.test(num)) return false;

  let sum = 0;
  let alternate = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = parseInt(num[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

function getCardNetwork(number) {
  const num = number.replace(/\D/g, '');
  if (/^4/.test(num)) return 'visa';
  if (/^5[1-5]/.test(num)) return 'mastercard';
  if (/^3[47]/.test(num)) return 'amex';
  if (/^(60|65|8[1-9])/.test(num)) return 'rupay';
  return 'unknown';
}

function isExpiryValid(month, year) {
  const m = parseInt(month, 10);
  if (m < 1 || m > 12) return false;

  let y = parseInt(year, 10);
  if (y < 100) y += 2000;

  const now = new Date();
  const exp = new Date(y, m - 1, 1);
  const current = new Date(now.getFullYear(), now.getMonth(), 1);

  return exp >= current;
}

async function generatePaymentId() {
  while (true) {
    const id = 'pay_' + uuidv4().replace(/-/g, '').slice(0, 16);
    const exists = await pool.query('SELECT 1 FROM payments WHERE id=$1', [id]);
    if (exists.rowCount === 0) return id;
  }
}

/* =====================================================
   AUTHENTICATED ENDPOINTS
===================================================== */
router.post('/', auth, async (req, res) => {
  try {
    const { order_id, method, vpa, card } = req.body;
    if (!order_id || !method)
      return res.status(400).json({ error: { code: 'BAD_REQUEST_ERROR', description: 'order_id and method required' } });

    const order = await OrderModel.getOrderById(order_id, req.merchant.id);
    if (!order)
      return res.status(404).json({ error: { code: 'NOT_FOUND_ERROR', description: 'Order not found' } });

    // Payment object
    const payment = {
      id: await generatePaymentId(),
      order_id,
      merchant_id: req.merchant.id,
      amount: order.amount,
      currency: order.currency,
      method,
      status: 'processing',
      vpa: null,
      card_network: null,
      card_last4: null,
      error_code: null,
      error_description: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    if (method === 'upi') {
      if (!vpa || !isValidVPA(vpa))
        return res.status(400).json({ error: { code: 'INVALID_VPA', description: 'Invalid VPA format' } });
      payment.vpa = vpa;
    } else if (method === 'card') {
      if (!card || !card.number || !card.expiry_month || !card.expiry_year || !card.cvv || !card.holder_name)
        return res.status(400).json({ error: { code: 'BAD_REQUEST_ERROR', description: 'Incomplete card details' } });
      if (!isValidCard(card.number))
        return res.status(400).json({ error: { code: 'INVALID_CARD', description: 'Invalid card number' } });
      if (!isExpiryValid(card.expiry_month, card.expiry_year))
        return res.status(400).json({ error: { code: 'INVALID_CARD_EXPIRY', description: 'Card expired' } });
      payment.card_network = getCardNetwork(card.number);
      payment.card_last4 = card.number.slice(-4);
    } else {
      return res.status(400).json({ error: { code: 'BAD_REQUEST_ERROR', description: 'Invalid method' } });
    }

    // Insert payment
    await pool.query(
      `INSERT INTO payments
       (id, order_id, merchant_id, amount, currency, method, status, vpa, card_network, card_last4, error_code, error_description, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [
        payment.id, payment.order_id, payment.merchant_id, payment.amount,
        payment.currency, payment.method, payment.status, payment.vpa,
        payment.card_network, payment.card_last4, payment.error_code, payment.error_description,
        payment.created_at, payment.updated_at
      ]
    );

    // Simulate async processing
    setTimeout(async () => {
      const success = Math.random() < 0.95;
      await pool.query(
        `UPDATE payments SET status=$1, updated_at=NOW() WHERE id=$2`,
        [success ? 'success' : 'failed', payment.id]
      );
    }, 3000);

    return res.status(201).json(payment);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: { code: 'SERVER_ERROR', description: err.message } });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM payments WHERE id=$1 AND merchant_id=$2',
      [req.params.id, req.merchant.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: { code: 'NOT_FOUND_ERROR', description: 'Payment not found' } });

    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', description: err.message } });
  }
});

/* =====================================================
   PUBLIC ENDPOINTS (for checkout page)
===================================================== */

// GET order details (public)
router.get('/public/order/:id', async (req, res) => {
  try {
    const order = await OrderModel.getOrderByIdPublic(req.params.id);
    if (!order) return res.status(404).json({ error: { code: 'NOT_FOUND_ERROR', description: 'Order not found' } });
    return res.json(order);
  } catch (err) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', description: err.message } });
  }
});

// POST payment (public)
router.post('/public', async (req, res) => {
  try {
    const { order_id, method, vpa, card } = req.body;
    if (!order_id || !method)
      return res.status(400).json({ error: { code: 'BAD_REQUEST_ERROR', description: 'order_id and method required' } });

    const order = await OrderModel.getOrderByIdPublic(order_id);
    if (!order) return res.status(404).json({ error: { code: 'NOT_FOUND_ERROR', description: 'Order not found' } });

    // Ensure merchant_id exists
    if (!order.merchant_id)
      return res.status(500).json({ error: { code: 'SERVER_ERROR', description: 'Merchant ID missing for this order' } });

    const payment = {
      id: await generatePaymentId(),
      order_id,
      merchant_id: order.merchant_id, // ✅ assign correctly
      amount: order.amount,
      currency: order.currency,
      method,
      status: 'processing',
      vpa: method === 'upi' ? vpa : null,
      card_network: method === 'card' ? getCardNetwork(card.number) : null,
      card_last4: method === 'card' ? card.number.slice(-4) : null,
      error_code: null,
      error_description: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await pool.query(
      `INSERT INTO payments
       (id, order_id, merchant_id, amount, currency, method, status, vpa, card_network, card_last4, error_code, error_description, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [
        payment.id, payment.order_id, payment.merchant_id, payment.amount,
        payment.currency, payment.method, payment.status, payment.vpa,
        payment.card_network, payment.card_last4, payment.error_code, payment.error_description,
        payment.created_at, payment.updated_at
      ]
    );

    // Simulate async processing
    setTimeout(async () => {
      const success = Math.random() < 0.95;
      await pool.query(
        `UPDATE payments SET status=$1, updated_at=NOW() WHERE id=$2`,
        [success ? 'success' : 'failed', payment.id]
      );
    }, 3000);

    return res.status(201).json(payment);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: { code: 'SERVER_ERROR', description: err.message } });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM payments WHERE merchant_id=$1 ORDER BY created_at DESC',
      [req.merchant.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('PAYMENTS LIST ERROR:', err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', description: err.message } });
  }
});
// GET order details (public)
router.get('/public/:id', async (req, res) => {
  try {
    const order = await OrderModel.getOrderByIdPublic(req.params.id);
    if (!order) return res.status(404).json({ error: { code: 'NOT_FOUND_ERROR', description: 'Order not found' } });
    return res.json(order);
  } catch (err) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', description: err.message } });
  }
});


module.exports = router;
