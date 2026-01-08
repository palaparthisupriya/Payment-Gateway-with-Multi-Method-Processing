const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../controllers/AuthMiddleware'); // Use same auth middleware as before

router.get('/', auth, async (req, res) => {
  try {
    const total = await pool.query(
      'SELECT COUNT(*) AS total, COALESCE(SUM(amount),0) AS total_amount FROM payments WHERE merchant_id=$1',
      [req.merchant.id]
    );
    const success = await pool.query(
      'SELECT COUNT(*) AS success_count FROM payments WHERE merchant_id=$1 AND status=$2',
      [req.merchant.id, 'success']
    );

    const totalTransactions = parseInt(total.rows[0].total);
    const totalAmount = parseInt(total.rows[0].total_amount);
    const successCount = parseInt(success.rows[0].success_count);
    const successRate = totalTransactions === 0 ? 0 : Math.round((successCount / totalTransactions) * 100);

    res.json({ total_transactions: totalTransactions, total_amount: totalAmount, success_rate: successRate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
