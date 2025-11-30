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

  const oldDate = existing.detectedDate
    ? new Date(existing.detectedDate).getTime()
    : null;
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

async function markCompleted(userId, id) {
  const reminder = await Reminder.findOne({ _id: id, user: userId });
  if (!reminder) throw new Error("Reminder not found");

  reminder.status = "completed";
  reminder.completedAt = new Date();
  await reminder.save();
  return reminder;
}

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
  listRemindersByFilter,
  markCompleted,
  markMissedWherePast,
  snoozeReminder
};
