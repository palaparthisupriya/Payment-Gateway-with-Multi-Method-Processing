// backend/src/services/OrderService.js
const pool = require("../config/db");
const { customAlphabet } = require("nanoid"); // install nanoid if not: npm i nanoid

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", 16);

async function createOrder({ merchantId, amount, currency, receipt = "", notes = {} }) {
  const id = "order_" + nanoid(); // generate 16-char order ID

  const result = await pool.query(
    `INSERT INTO orders (id, merchant_id, amount, currency, receipt, notes, status, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,'created',NOW(),NOW())
     RETURNING *`,
    [id, merchantId, amount, currency, receipt, JSON.stringify(notes)]
  );

  return result.rows[0];
}

async function getOrderById(id, merchantId) {
  const result = await pool.query(
    `SELECT * FROM orders WHERE id=$1 AND merchant_id=$2`,
    [id, merchantId]
  );
  return result.rows[0];
}

module.exports = {
  createOrder,
  getOrderById,
};
