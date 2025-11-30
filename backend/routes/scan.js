const express = require("express");
const { scanForUser } = require("../services/gmailService");

const router = express.Router();

// POST /api/scan { unreadOnly?: boolean }
router.post("/scan", async (req, res) => {
  try {
    const unreadOnly = !!req.body.unreadOnly;
    const userId = req.session.userId;
    const result = await scanForUser(userId, { unreadOnly });
    res.json(result);
  } catch (err) {
    console.error("Scan error:", err);
    res.status(500).json({ error: "Scan failed" });
  }
});

module.exports = router;
