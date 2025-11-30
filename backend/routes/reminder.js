const express = require("express");
const {
  listRemindersByFilter,
  markCompleted,
  snoozeReminder
} = require("../services/reminderService");

const router = express.Router();

// GET /api/reminders?filter=upcoming|completed|missed
router.get("/reminders", async (req, res) => {
  try {
    const filter = req.query.filter || "upcoming";
    const userId = req.session.userId;
    const reminders = await listRemindersByFilter(userId, filter);
    res.json(reminders);
  } catch (err) {
    console.error("List reminders error:", err);
    res.status(500).json({ error: "Failed to list reminders" });
  }
});

// POST /api/reminders/:id/complete
router.post("/reminders/:id/complete", async (req, res) => {
  try {
    const userId = req.session.userId;
    const reminder = await markCompleted(userId, req.params.id);
    res.json(reminder);
  } catch (err) {
    console.error("Complete error:", err);
    res.status(500).json({ error: "Failed to mark complete" });
  }
});

// POST /api/reminders/:id/snooze { snoozeTo: ISO string }
router.post("/reminders/:id/snooze", async (req, res) => {
  try {
    const userId = req.session.userId;
    const snoozeTo = new Date(req.body.snoozeTo);
    if (isNaN(snoozeTo.getTime())) {
      return res.status(400).json({ error: "Invalid snoozeTo date" });
    }
    const reminder = await snoozeReminder(userId, req.params.id, snoozeTo);
    res.json(reminder);
  } catch (err) {
    console.error("Snooze error:", err);
    res.status(500).json({ error: "Failed to snooze reminder" });
  }
});

module.exports = router;
