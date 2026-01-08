// backend/src/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'payment_gateway',
  port: process.env.DB_PORT || 5432,
});

pool.on('connect', () => console.log('✅ Connected to PostgreSQL database'));
pool.on('error', (err) => {
  console.error('❌ PostgreSQL error', err);
  process.exit(1);
});

module.exports = pool;
