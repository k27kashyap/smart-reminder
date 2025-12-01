// // backend/services/reminderService.js
// const Reminder = require("../models/Reminder");

// /**
//  * Upsert reminder by (user, company, role).
//  * If existing and date changed, update + push to history.
//  */
// async function upsertReminder(userId, data) {
//   const { company, role, detectedDate, subject, snippet, sender, links, sourceMessageId } =
//     data;

//   const existing = await Reminder.findOne({ user: userId, company, role });

//   if (!existing) {
//     const reminder = await Reminder.create({
//       user: userId,
//       company,
//       role,
//       subject,
//       snippet,
//       sender,
//       links,
//       detectedDate,
//       sourceMessageId,
//       createdAt: new Date()
//     });
//     return { type: "created", reminder };
//   }

//   const oldDate = existing.detectedDate ? new Date(existing.detectedDate).getTime() : null;
//   const newDateMs = new Date(detectedDate).getTime();

//   if (oldDate !== newDateMs) {
//     existing.history.push({
//       detectedDate: existing.detectedDate,
//       updatedAt: existing.updatedAt || existing.createdAt,
//       sourceMessageId: existing.sourceMessageId
//     });
//     existing.detectedDate = detectedDate;
//     existing.subject = subject;
//     existing.snippet = snippet;
//     existing.sender = sender;
//     existing.links = links;
//     existing.sourceMessageId = sourceMessageId;
//     existing.updatedAt = new Date();
//     await existing.save();
//     return { type: "updated", reminder: existing };
//   }

//   return { type: "skipped", reminder: existing };
// }

// /**
//  * Create a manual reminder (from frontend form)
//  */
// async function createReminder(userId, data) {
//   const {
//     company,
//     role,
//     detectedDate,
//     subject,
//     snippet,
//     sender,
//     links = [],
//     sourceMessageId = null
//   } = data;

//   const reminder = await Reminder.create({
//     user: userId,
//     company,
//     role,
//     subject,
//     snippet,
//     sender,
//     links,
//     detectedDate,
//     sourceMessageId,
//     createdAt: new Date(),
//     updatedAt: new Date()
//   });

//   return reminder;
// }

// /**
//  * Update an existing reminder by id (only allowed for owner)
//  */
// async function updateReminder(userId, id, data) {
//   const reminder = await Reminder.findOne({ _id: id, user: userId });
//   if (!reminder) throw new Error("Reminder not found");

//   // store previous date in history if date changes
//   if (data.detectedDate && new Date(data.detectedDate).getTime() !== new Date(reminder.detectedDate).getTime()) {
//     reminder.history.push({
//       detectedDate: reminder.detectedDate,
//       updatedAt: reminder.updatedAt || reminder.createdAt,
//       sourceMessageId: reminder.sourceMessageId
//     });
//     reminder.detectedDate = data.detectedDate;
//   }

//   // update fields
//   if (data.subject !== undefined) reminder.subject = data.subject;
//   if (data.snippet !== undefined) reminder.snippet = data.snippet;
//   if (data.company !== undefined) reminder.company = data.company;
//   if (data.role !== undefined) reminder.role = data.role;
//   if (data.links !== undefined) reminder.links = data.links;
//   if (data.sender !== undefined) reminder.sender = data.sender;
//   reminder.updatedAt = new Date();

//   // If user edits a completed item and sets a future date, revert status to upcoming
//   if (reminder.status === "completed" && new Date(reminder.detectedDate) > new Date()) {
//     reminder.status = "upcoming";
//     reminder.completedAt = null;
//     reminder.missedAt = null;
//   }

//   await reminder.save();
//   return reminder;
// }

// /**
//  * List reminders by filter (upcoming/completed/missed) with 10-day cutoff for completed/missed
//  */
// async function listRemindersByFilter(userId, filter) {
//   const now = new Date();
//   const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 3600 * 1000);

//   if (filter === "completed") {
//     return Reminder.find({
//       user: userId,
//       status: "completed",
//       completedAt: { $gte: tenDaysAgo }
//     }).sort({ completedAt: -1 });
//   }

//   if (filter === "missed") {
//     return Reminder.find({
//       user: userId,
//       status: "missed",
//       missedAt: { $gte: tenDaysAgo }
//     }).sort({ missedAt: -1 });
//   }

//   // upcoming
//   return Reminder.find({
//     user: userId,
//     status: "upcoming",
//     detectedDate: { $gte: now }
//   }).sort({ detectedDate: 1 });
// }

// /**
//  * Mark a reminder as completed
//  */
// async function markCompleted(userId, id) {
//   const reminder = await Reminder.findOne({ _id: id, user: userId });
//   if (!reminder) throw new Error("Reminder not found");

//   reminder.status = "completed";
//   reminder.completedAt = new Date();
//   await reminder.save();
//   return reminder;
// }

// /**
//  * Uncomplete: revert completed -> upcoming (used by frontend uncheck)
//  */
// async function uncompleteReminder(userId, id) {
//   const reminder = await Reminder.findOne({ _id: id, user: userId });
//   if (!reminder) throw new Error("Reminder not found");

//   // Only allow uncomplete if previously completed
//   if (reminder.status !== "completed") {
//     throw new Error("Reminder is not completed");
//   }

//   // revert status
//   reminder.status = "upcoming";
//   reminder.completedAt = null;
//   reminder.missedAt = null;
//   reminder.updatedAt = new Date();
//   await reminder.save();
//   return reminder;
// }

// /**
//  * Mark missed for any upcoming reminders with date < now
//  */
// async function markMissedWherePast() {
//   const now = new Date();
//   await Reminder.updateMany(
//     {
//       status: "upcoming",
//       detectedDate: { $lt: now }
//     },
//     {
//       $set: { status: "missed", missedAt: now }
//     }
//   );
// }

// /**
//  * Snooze existing reminder to new date
//  */
// async function snoozeReminder(userId, id, newDate) {
//   const reminder = await Reminder.findOne({ _id: id, user: userId });
//   if (!reminder) throw new Error("Reminder not found");

//   reminder.history.push({
//     detectedDate: reminder.detectedDate,
//     updatedAt: reminder.updatedAt || reminder.createdAt,
//     sourceMessageId: reminder.sourceMessageId
//   });

//   reminder.detectedDate = newDate;
//   reminder.status = "upcoming";
//   reminder.completedAt = null;
//   reminder.missedAt = null;
//   reminder.updatedAt = new Date();
//   await reminder.save();
//   return reminder;
// }

// module.exports = {
//   upsertReminder,
//   createReminder,
//   updateReminder,
//   uncompleteReminder,
//   listRemindersByFilter,
//   markCompleted,
//   markMissedWherePast,
//   snoozeReminder
// };


// backend/services/reminderService.js
const Reminder = require("../models/Reminder");

/**
 * Decide whether new parsed result is an improvement over existing one.
 * Improvement rules:
 *  - If existing has no detectedDate and new has one => improve
 *  - If existing has date but new has explicit time and existing doesn't => improve
 *  - If both have dates, but different timestamps => improve
 *  - If existing has date but candidate is null => NOT improvement
 */
function isImprovement(existing, candidate) {
  const existingDateMs = existing.detectedDate ? new Date(existing.detectedDate).getTime() : null;
  const candidateDateMs = candidate.detectedDate ? new Date(candidate.detectedDate).getTime() : null;

  // New has date and existing doesn't
  if (candidateDateMs && !existingDateMs) return true;

  // New has explicit time while existing does not
  if (candidate.dueTime && !existing.dueTime) return true;

  // If both have dates and they differ (use ms comparison)
  if (existingDateMs && candidateDateMs && existingDateMs !== candidateDateMs) return true;

  // Otherwise not an improvement
  return false;
}

/**
 * Upsert reminder:
 * - Prefer dedupe by sourceMessageId
 * - Fallback to user+company+role match
 * - Only overwrite when candidate is an improvement (or when no existing)
 */
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

  // Try dedupe by sourceMessageId first
  let existing = null;
  if (sourceMessageId) {
    existing = await Reminder.findOne({ user: userId, sourceMessageId });
  }

  // Fallback: user + company + role (legacy behavior)
  if (!existing) {
    existing = await Reminder.findOne({ user: userId, company, role });
  }

  // If nothing exists, create a new reminder
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

  // If existing found, decide whether to update
  const candidate = {
    detectedDate: detectedDate || null,
    dueDate: dueDate || null,
    dueTime: dueTime || null
  };

  // If candidate is not an improvement and detectedDate is null (or equal), skip
  if (!isImprovement(existing, candidate)) {
    return { type: "skipped", reminder: existing };
  }

  // push prior state into history
  existing.history = existing.history || [];
  existing.history.push({
    detectedDate: existing.detectedDate || null,
    dueDate: existing.dueDate || null,
    dueTime: existing.dueTime || null,
    updatedAt: existing.updatedAt || existing.createdAt,
    sourceMessageId: existing.sourceMessageId || null
  });

  // update fields
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

/**
 * Create a manual reminder (from frontend form)
 */
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

/**
 * Update an existing reminder by id (only allowed for owner)
 */
async function updateReminder(userId, id, data) {
  const reminder = await Reminder.findOne({ _id: id, user: userId });
  if (!reminder) throw new Error("Reminder not found");

  // store previous date in history if date changes
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

  // update fields
  if (data.subject !== undefined) reminder.subject = data.subject;
  if (data.snippet !== undefined) reminder.snippet = data.snippet;
  if (data.company !== undefined) reminder.company = data.company;
  if (data.role !== undefined) reminder.role = data.role;
  if (data.links !== undefined) reminder.links = data.links;
  if (data.sender !== undefined) reminder.sender = data.sender;

  // also allow direct edits to dueDate/dueTime/noDue flags if provided
  if (data.dueDate !== undefined) reminder.dueDate = data.dueDate;
  if (data.dueTime !== undefined) reminder.dueTime = data.dueTime;
  if (data.noDueDate !== undefined) reminder.noDueDate = !!data.noDueDate;
  if (data.noDueTime !== undefined) reminder.noDueTime = !!data.noDueTime;

  reminder.updatedAt = new Date();

  // If user edits a completed item and sets a future date, revert status to upcoming
  if (reminder.status === "completed" && reminder.detectedDate && new Date(reminder.detectedDate) > new Date()) {
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

  // upcoming: ensure detectedDate exists and is >= now
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

  reminder.history = reminder.history || [];
  reminder.history.push({
    detectedDate: reminder.detectedDate || null,
    dueDate: reminder.dueDate || null,
    dueTime: reminder.dueTime || null,
    updatedAt: reminder.updatedAt || reminder.createdAt,
    sourceMessageId: reminder.sourceMessageId || null
  });

  reminder.detectedDate = newDate;
  // if newDate provided but dueTime/dueDate not provided, keep existing dueDate/dueTime as-is
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
