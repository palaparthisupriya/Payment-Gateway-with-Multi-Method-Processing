const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await pool.query('SELECT 1');
    dbStatus = 'connected';
  } catch {}
  res.status(200).json({
    status: 'healthy',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
