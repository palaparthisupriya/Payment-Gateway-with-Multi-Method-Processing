const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

async function createTestMerchant() {
  try {
    const existing = await pool.query("SELECT * FROM merchants WHERE email=$1", ["test@example.com"]);
    if (existing.rows.length) return;

    const id = uuidv4();
    await pool.query(
      `INSERT INTO merchants (id, name, email, api_key, api_secret, is_active, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,true,NOW(),NOW())`,
      [id, "Test Merchant", "test@example.com", "test_api_key_123", "test_secret_key_123"]
    );

    console.log("✅ Test merchant created");
  } catch (err) {
    console.error("❌ Error creating test merchant:", err.message);
  }
}

async function findByApiKey(apiKey) {
  const res = await pool.query("SELECT * FROM merchants WHERE api_key=$1 AND is_active=true", [apiKey]);
  return res.rows[0];
}

module.exports = { createTestMerchant, findByApiKey };
