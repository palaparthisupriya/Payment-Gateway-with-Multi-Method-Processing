const express = require("express");
const pool = require("../config/db");

const router = express.Router();

// GET /api/v1/test/merchant
router.get("/merchant", async (req, res) => {
  try {
    const query = `SELECT id, name, email, api_key, api_secret, is_active FROM merchants LIMIT 1`;
    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Test merchant not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("TEST MERCHANT ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
