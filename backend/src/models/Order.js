// backend/src/models/Order.js
const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Create a new order
async function createOrder({ merchant_id, amount, currency, receipt, notes }) {
  const id = 'order_' + uuidv4().replace(/-/g, '').slice(0, 16);
  const result = await pool.query(
    `INSERT INTO orders (id, merchant_id, amount, currency, receipt, notes, status, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,'created',NOW(),NOW())
     RETURNING *`,
    [id, merchant_id, amount, currency, receipt, notes]
  );
  return result.rows[0];
}

// Get order by ID (authenticated, requires merchantId)
async function getOrderById(orderId, merchantId) {
  const result = await pool.query(
    "SELECT * FROM orders WHERE id=$1 AND merchant_id=$2",
    [orderId, merchantId]
  );
  return result.rows[0];
}

// Get order by ID for public access (unauthenticated)
async function getOrderByIdPublic(orderId) {
  const result = await pool.query(
    "SELECT id, amount, currency, status FROM orders WHERE id=$1",
    [orderId]
  );
  return result.rows[0];
}
async function getOrderByIdPublic(orderId) {
  const result = await pool.query("SELECT id, merchant_id, amount, currency, status FROM orders WHERE id=$1", [orderId]);
  return result.rows[0];
}


module.exports = { createOrder, getOrderById, getOrderByIdPublic };

