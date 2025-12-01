const express = require("express");
const { saveSubscription, removeSubscription } = require("../services/pushService");

const router = express.Router();

router.post("/push/register", async (req, res) => {
  try {
    const userId = req.session.userId;
    const subscription = req.body.subscription;
    if (!subscription) return res.status(400).json({ error: "Missing subscription" });

    const subs = await saveSubscription(userId, subscription);
    res.json({ count: subs.length });
  } catch (err) {
    console.error("Register push error:", err);
    res.status(500).json({ error: "Failed to register subscription" });
  }
});

router.post("/push/unregister", async (req, res) => {
  try {
    const userId = req.session.userId;
    const endpoint = req.body.endpoint;
    if (!endpoint) return res.status(400).json({ error: "Missing endpoint" });
    await removeSubscription(userId, endpoint);
    res.json({ ok: true });
  } catch (err) {
    console.error("Unregister push error:", err);
    res.status(500).json({ error: "Failed to unregister subscription" });
  }
});

module.exports = router;
