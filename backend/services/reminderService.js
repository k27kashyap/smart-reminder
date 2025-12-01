// backend/services/reminderService.js
const Reminder = require("../models/Reminder");

/**
 * Upsert reminder by (user, company, role).
 * If existing and date changed, update + push to history.
 */
async function upsertReminder(userId, data) {
  const { company, role, detectedDate, subject, snippet, sender, links, sourceMessageId } =
    data;

  const existing = await Reminder.findOne({ user: userId, company, role });

  if (!existing) {
    const reminder = await Reminder.create({
      user: userId,
      company,
      role,
      subject,
      snippet,
      sender,
      links,
      detectedDate,
      sourceMessageId,
      createdAt: new Date()
    });
    return { type: "created", reminder };
  }

  const oldDate = existing.detectedDate ? new Date(existing.detectedDate).getTime() : null;
  const newDateMs = new Date(detectedDate).getTime();

  if (oldDate !== newDateMs) {
    existing.history.push({
      detectedDate: existing.detectedDate,
      updatedAt: existing.updatedAt || existing.createdAt,
      sourceMessageId: existing.sourceMessageId
    });
    existing.detectedDate = detectedDate;
    existing.subject = subject;
    existing.snippet = snippet;
    existing.sender = sender;
    existing.links = links;
    existing.sourceMessageId = sourceMessageId;
    existing.updatedAt = new Date();
    await existing.save();
    return { type: "updated", reminder: existing };
  }

  return { type: "skipped", reminder: existing };
}

/**
 * Create a manual reminder (from frontend form)
 */
async function createReminder(userId, data) {
  const {
    company,
    role,
    detectedDate,
    subject,
    snippet,
    sender,
    links = [],
    sourceMessageId = null
  } = data;

  const reminder = await Reminder.create({
    user: userId,
    company,
    role,
    subject,
    snippet,
    sender,
    links,
    detectedDate,
    sourceMessageId,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  return reminder;
}

/**
 * Update an existing reminder by id (only allowed for owner)
 */
async function updateReminder(userId, id, data) {
  const reminder = await Reminder.findOne({ _id: id, user: userId });
  if (!reminder) throw new Error("Reminder not found");

  // store previous date in history if date changes
  if (data.detectedDate && new Date(data.detectedDate).getTime() !== new Date(reminder.detectedDate).getTime()) {
    reminder.history.push({
      detectedDate: reminder.detectedDate,
      updatedAt: reminder.updatedAt || reminder.createdAt,
      sourceMessageId: reminder.sourceMessageId
    });
    reminder.detectedDate = data.detectedDate;
  }

  // update fields
  if (data.subject !== undefined) reminder.subject = data.subject;
  if (data.snippet !== undefined) reminder.snippet = data.snippet;
  if (data.company !== undefined) reminder.company = data.company;
  if (data.role !== undefined) reminder.role = data.role;
  if (data.links !== undefined) reminder.links = data.links;
  if (data.sender !== undefined) reminder.sender = data.sender;
  reminder.updatedAt = new Date();

  // If user edits a completed item and sets a future date, revert status to upcoming
  if (reminder.status === "completed" && new Date(reminder.detectedDate) > new Date()) {
    reminder.status = "upcoming";
    reminder.completedAt = null;
    reminder.missedAt = null;
  }

  await reminder.save();
  return reminder;
}

/**
 * List reminders by filter (upcoming/completed/missed) with 10-day cutoff for completed/missed
 */
async function listRemindersByFilter(userId, filter) {
  const now = new Date();
  const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 3600 * 1000);

  if (filter === "completed") {
    return Reminder.find({
      user: userId,
      status: "completed",
      completedAt: { $gte: tenDaysAgo }
    }).sort({ completedAt: -1 });
  }

  if (filter === "missed") {
    return Reminder.find({
      user: userId,
      status: "missed",
      missedAt: { $gte: tenDaysAgo }
    }).sort({ missedAt: -1 });
  }

  // upcoming
  return Reminder.find({
    user: userId,
    status: "upcoming",
    detectedDate: { $gte: now }
  }).sort({ detectedDate: 1 });
}

/**
 * Mark a reminder as completed
 */
async function markCompleted(userId, id) {
  const reminder = await Reminder.findOne({ _id: id, user: userId });
  if (!reminder) throw new Error("Reminder not found");

  reminder.status = "completed";
  reminder.completedAt = new Date();
  await reminder.save();
  return reminder;
}

/**
 * Uncomplete: revert completed -> upcoming (used by frontend uncheck)
 */
async function uncompleteReminder(userId, id) {
  const reminder = await Reminder.findOne({ _id: id, user: userId });
  if (!reminder) throw new Error("Reminder not found");

  // Only allow uncomplete if previously completed
  if (reminder.status !== "completed") {
    throw new Error("Reminder is not completed");
  }

  // revert status
  reminder.status = "upcoming";
  reminder.completedAt = null;
  reminder.missedAt = null;
  reminder.updatedAt = new Date();
  await reminder.save();
  return reminder;
}

/**
 * Mark missed for any upcoming reminders with date < now
 */
async function markMissedWherePast() {
  const now = new Date();
  await Reminder.updateMany(
    {
      status: "upcoming",
      detectedDate: { $lt: now }
    },
    {
      $set: { status: "missed", missedAt: now }
    }
  );
}

/**
 * Snooze existing reminder to new date
 */
async function snoozeReminder(userId, id, newDate) {
  const reminder = await Reminder.findOne({ _id: id, user: userId });
  if (!reminder) throw new Error("Reminder not found");

  reminder.history.push({
    detectedDate: reminder.detectedDate,
    updatedAt: reminder.updatedAt || reminder.createdAt,
    sourceMessageId: reminder.sourceMessageId
  });

  reminder.detectedDate = newDate;
  reminder.status = "upcoming";
  reminder.completedAt = null;
  reminder.missedAt = null;
  reminder.updatedAt = new Date();
  await reminder.save();
  return reminder;
}

module.exports = {
  upsertReminder,
  createReminder,
  updateReminder,
  uncompleteReminder,
  listRemindersByFilter,
  markCompleted,
  markMissedWherePast,
  snoozeReminder
};
