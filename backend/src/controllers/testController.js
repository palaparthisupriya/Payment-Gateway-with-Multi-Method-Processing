import db from "../db.js"; // your Postgres connection

export const getTestMerchant = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, name, email, api_key, api_secret, is_active FROM merchants WHERE email = $1",
      ["test@example.com"] // make sure your test merchant email matches
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: { code: "NOT_FOUND", description: "Test merchant not found" } });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET TEST MERCHANT ERROR:", err);
    res.status(500).json({ error: { code: "SERVER_ERROR", description: "Something went wrong" } });
  }
};
