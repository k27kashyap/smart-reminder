// backend/routes/reminders.js
const express = require("express");
const {
  listRemindersByFilter,
  markCompleted,
  snoozeReminder,
  createReminder,
  updateReminder,
  uncompleteReminder
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

// POST /api/reminders  (create manual)
router.post("/reminders", async (req, res) => {
  try {
    const userId = req.session.userId;
    const payload = req.body;

    // Validate required
    if (!payload.subject || !payload.detectedDate) {
      return res.status(400).json({ error: "subject and detectedDate are required" });
    }

    const created = await createReminder(userId, payload);
    res.status(201).json(created);
  } catch (err) {
    console.error("Create reminder error:", err);
    res.status(500).json({ error: "Failed to create reminder" });
  }
});

// PUT /api/reminders/:id  (update)
router.put("/reminders/:id", async (req, res) => {
  try {
    const userId = req.session.userId;
    const id = req.params.id;
    const payload = req.body;

    const updated = await updateReminder(userId, id, payload);
    res.json(updated);
  } catch (err) {
    console.error("Update reminder error:", err);
    res.status(500).json({ error: "Failed to update reminder" });
  }
});

// POST /api/reminders/:id/complete
router.post("/reminders/:id/complete", async (req, res) => {
  try {
    const userId = req.session.userId;
    const id = req.params.id;
    const reminder = await markCompleted(userId, id);
    res.json(reminder);
  } catch (err) {
    console.error("Complete error:", err);
    res.status(500).json({ error: "Failed to mark complete" });
  }
});

// POST /api/reminders/:id/uncomplete  (revert completed -> upcoming)
router.post("/reminders/:id/uncomplete", async (req, res) => {
  try {
    const userId = req.session.userId;
    const id = req.params.id;
    const reminder = await uncompleteReminder(userId, id);
    res.json(reminder);
  } catch (err) {
    console.error("Uncomplete error:", err);
    res.status(500).json({ error: "Failed to uncomplete reminder" });
  }
});

// POST /api/reminders/:id/snooze { snoozeTo }
router.post("/reminders/:id/snooze", async (req, res) => {
  try {
    const userId = req.session.userId;
    const id = req.params.id;
    const snoozeTo = new Date(req.body.snoozeTo);
    if (isNaN(snoozeTo.getTime())) {
      return res.status(400).json({ error: "Invalid snoozeTo date" });
    }
    const reminder = await snoozeReminder(userId, id, snoozeTo);
    res.json(reminder);
  } catch (err) {
    console.error("Snooze error:", err);
    res.status(500).json({ error: "Failed to snooze reminder" });
  }
});

// DELETE /api/reminders/:id
router.delete("/reminders/:id", async (req, res) => {
  try {
    const userId = req.session.userId;
    const id = req.params.id;
    const deleted = await require("../models/Reminder").findOneAndDelete({ _id: id, user: userId });
    if (!deleted) return res.status(404).json({ error: "Reminder not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete reminder" });
  }
});

module.exports = router;
