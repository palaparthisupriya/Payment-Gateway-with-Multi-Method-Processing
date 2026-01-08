const pool = require("../config/db");

async function createPayment(data) {
  const {
    id,
    order_id,
    merchant_id,
    amount,
    currency,
    method,
    status,
    vpa,
    card_network,
    card_last4
  } = data;

  const result = await pool.query(
    `INSERT INTO payments
     (id, order_id, merchant_id, amount, currency, method, status, vpa, card_network, card_last4)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [
      id,
      order_id,
      merchant_id,
      amount,
      currency,
      method,
      status,
      vpa || null,
      card_network || null,
      card_last4 || null
    ]
  );

  return result.rows[0];
}

async function updatePayment(id, updates) {
  const { status, error_code, error_description } = updates;

  await pool.query(
    `UPDATE payments
     SET status=$1,
         error_code=$2,
         error_description=$3,
         updated_at=NOW()
     WHERE id=$4`,
    [status, error_code || null, error_description || null, id]
  );
}

async function getPaymentById(id) {
  const result = await pool.query(
    `SELECT * FROM payments WHERE id=$1`,
    [id]
  );
  return result.rows[0];
}

module.exports = {
  createPayment,
  updatePayment,
  getPaymentById
};
