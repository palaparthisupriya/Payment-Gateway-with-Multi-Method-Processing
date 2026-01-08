// backend/src/controllers/DashboardController.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const MerchantModel = require('../models/Merchant');

// ------------------- AUTH MIDDLEWARE -------------------
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
    res.status(500).json({ error: { code: 'SERVER_ERROR', description: err.message } });
  }
}

// ------------------- GET DASHBOARD STATS -------------------
router.get('/stats', auth, async (req, res) => {
  try {
    const merchantId = req.merchant.id;

    // Get all payments for this merchant
    const paymentsResult = await pool.query(
      'SELECT amount, status FROM payments WHERE merchant_id=$1',
      [merchantId]
    );

    const payments = paymentsResult.rows;

    const totalTransactions = payments.length;
    const totalAmount = payments
      .filter(p => p.status === 'success')
      .reduce((sum, p) => sum + p.amount, 0);

    const successRate =
      totalTransactions === 0
        ? 0
        : Math.round(
            (payments.filter(p => p.status === 'success').length / totalTransactions) * 100
          );

    res.json({ totalTransactions, totalAmount, successRate });
  } catch (err) {
    console.error('DASHBOARD STATS ERROR:', err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', description: err.message } });
  }
});

module.exports = router;
