const Reminder = require("../models/Reminder");

function isImprovement(existing, candidate) {
  const existingDateMs = existing.detectedDate ? new Date(existing.detectedDate).getTime() : null;
  const candidateDateMs = candidate.detectedDate ? new Date(candidate.detectedDate).getTime() : null;

  if (candidateDateMs && !existingDateMs) return true;

  if (candidate.dueTime && !existing.dueTime) return true;

  if (existingDateMs && candidateDateMs && existingDateMs !== candidateDateMs) return true;

  return false;
}

async function upsertReminder(userId, data) {
  const {
    company,
    role,
    detectedDate,
    dueDate,
    dueTime,
    noDueDate,
    noDueTime,
    matchedText,
    subject,
    snippet,
    sender,
    links = [],
    sourceMessageId
  } = data;

  let existing = null;
  if (sourceMessageId) {
    existing = await Reminder.findOne({ user: userId, sourceMessageId });
  }

  if (!existing) {
    existing = await Reminder.findOne({ user: userId, company, role });
  }

  if (!existing) {
    const reminder = await Reminder.create({
      user: userId,
      company,
      role,
      subject,
      snippet,
      sender,
      links,
      detectedDate: detectedDate || null,
      dueDate: dueDate || null,
      dueTime: dueTime || null,
      noDueDate: !!noDueDate,
      noDueTime: !!noDueTime,
      matchedText: matchedText || null,
      sourceMessageId: sourceMessageId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { type: "created", reminder };
  }

  const candidate = {
    detectedDate: detectedDate || null,
    dueDate: dueDate || null,
    dueTime: dueTime || null
  };

  if (!isImprovement(existing, candidate)) {
    return { type: "skipped", reminder: existing };
  }

  existing.history = existing.history || [];
  existing.history.push({
    detectedDate: existing.detectedDate || null,
    dueDate: existing.dueDate || null,
    dueTime: existing.dueTime || null,
    updatedAt: existing.updatedAt || existing.createdAt,
    sourceMessageId: existing.sourceMessageId || null
  });

  existing.detectedDate = detectedDate || existing.detectedDate;
  existing.dueDate = dueDate ?? existing.dueDate;
  existing.dueTime = dueTime ?? existing.dueTime;
  existing.noDueDate = typeof noDueDate === "boolean" ? noDueDate : existing.noDueDate;
  existing.noDueTime = typeof noDueTime === "boolean" ? noDueTime : existing.noDueTime;
  existing.matchedText = matchedText || existing.matchedText;
  existing.subject = subject || existing.subject;
  existing.snippet = snippet || existing.snippet;
  existing.sender = sender || existing.sender;
  existing.links = links || existing.links;
  existing.sourceMessageId = sourceMessageId || existing.sourceMessageId;
  existing.updatedAt = new Date();

  await existing.save();
  return { type: "updated", reminder: existing };
}

async function createReminder(userId, data) {
  const {
    company,
    role,
    detectedDate,
    dueDate,
    dueTime,
    noDueDate,
    noDueTime,
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
    detectedDate: detectedDate || null,
    dueDate: dueDate || null,
    dueTime: dueTime || null,
    noDueDate: !!noDueDate,
    noDueTime: !!noDueTime,
    sourceMessageId,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  return reminder;
}

async function updateReminder(userId, id, data) {
  const reminder = await Reminder.findOne({ _id: id, user: userId });
  if (!reminder) throw new Error("Reminder not found");

  if (data.detectedDate && new Date(data.detectedDate).getTime() !== new Date(reminder.detectedDate).getTime()) {
    reminder.history = reminder.history || [];
    reminder.history.push({
      detectedDate: reminder.detectedDate || null,
      dueDate: reminder.dueDate || null,
      dueTime: reminder.dueTime || null,
      updatedAt: reminder.updatedAt || reminder.createdAt,
      sourceMessageId: reminder.sourceMessageId || null
    });
    reminder.detectedDate = data.detectedDate;
  }

  if (data.subject !== undefined) reminder.subject = data.subject;
  if (data.snippet !== undefined) reminder.snippet = data.snippet;
  if (data.company !== undefined) reminder.company = data.company;
  if (data.role !== undefined) reminder.role = data.role;
  if (data.links !== undefined) reminder.links = data.links;
  if (data.sender !== undefined) reminder.sender = data.sender;

  if (data.dueDate !== undefined) reminder.dueDate = data.dueDate;
  if (data.dueTime !== undefined) reminder.dueTime = data.dueTime;
  if (data.noDueDate !== undefined) reminder.noDueDate = !!data.noDueDate;
  if (data.noDueTime !== undefined) reminder.noDueTime = !!data.noDueTime;

  reminder.updatedAt = new Date();

  if (reminder.status === "completed" && reminder.detectedDate && new Date(reminder.detectedDate) > new Date()) {
    reminder.status = "upcoming";
    reminder.completedAt = null;
    reminder.missedAt = null;
  }

  await reminder.save();
  return reminder;
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

async function uncompleteReminder(userId, id) {
  const reminder = await Reminder.findOne({ _id: id, user: userId });
  if (!reminder) throw new Error("Reminder not found");

  if (reminder.status !== "completed") {
    throw new Error("Reminder is not completed");
  }

  reminder.status = "upcoming";
  reminder.completedAt = null;
  reminder.missedAt = null;
  reminder.updatedAt = new Date();
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

  reminder.history = reminder.history || [];
  reminder.history.push({
    detectedDate: reminder.detectedDate || null,
    dueDate: reminder.dueDate || null,
    dueTime: reminder.dueTime || null,
    updatedAt: reminder.updatedAt || reminder.createdAt,
    sourceMessageId: reminder.sourceMessageId || null
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
