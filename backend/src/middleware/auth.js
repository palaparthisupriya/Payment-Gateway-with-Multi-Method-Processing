const pool = require('../config/db');

async function auth(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const apiSecret = req.headers['x-api-secret'];

  if (!apiKey || !apiSecret)
    return res.status(401).json({ error: { code: 'AUTHENTICATION_ERROR', description: 'Invalid API credentials' } });

  try {
    const { rows } = await pool.query(
      "SELECT * FROM merchants WHERE api_key=$1 AND api_secret=$2 AND is_active=true",
      [apiKey, apiSecret]
    );

    if (!rows.length)
      return res.status(401).json({ error: { code: 'AUTHENTICATION_ERROR', description: 'Invalid API credentials' } });

    req.merchant = rows[0];
    next();
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', description: err.message } });
  }
}

module.exports = auth;
