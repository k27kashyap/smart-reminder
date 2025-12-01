// const mongoose = require("mongoose");

// const HistorySchema = new mongoose.Schema(
//   {
//     detectedDate: Date,
//     updatedAt: Date,
//     sourceMessageId: String
//   },
//   { _id: false }
// );

// const ReminderSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

//   company: String,
//   role: String,
//   subject: String,
//   snippet: String,
//   links: [String],

//   detectedDate: { type: Date, required: true },
//   sourceMessageId: String,
//   sender: String,

//   status: {
//     type: String,
//     enum: ["upcoming", "completed", "missed"],
//     default: "upcoming"
//   },
//   completedAt: Date,
//   missedAt: Date,

//   createdAt: { type: Date, default: Date.now },
//   updatedAt: Date,

//   history: [HistorySchema]
// });

// ReminderSchema.index({ user: 1, detectedDate: 1 });

// module.exports = mongoose.model("Reminder", ReminderSchema);








const mongoose = require("mongoose");

const HistorySchema = new mongoose.Schema(
  {
    detectedDate: Date,
    dueDate: String,
    dueTime: String,
    updatedAt: Date,
    sourceMessageId: String
  },
  { _id: false }
);

const ReminderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  company: String,
  role: String,
  subject: String,
  snippet: String,
  links: [String],

  // main detected datetime (nullable now)
  detectedDate: { type: Date, default: null },

  // explicit date/time components only when present in the email text
  dueDate: { type: String, default: null }, // "YYYY-MM-DD"
  dueTime: { type: String, default: null }, // "HH:MM"

  // flags to indicate absence of explicit date/time
  noDueDate: { type: Boolean, default: false },
  noDueTime: { type: Boolean, default: false },

  // store original matched substring (optional, helps audit)
  matchedText: { type: String, default: null },

  sourceMessageId: { type: String, index: true },
  sender: String,

  status: {
    type: String,
    enum: ["upcoming", "completed", "missed"],
    default: "upcoming"
  },
  completedAt: Date,
  missedAt: Date,

  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,

  history: [HistorySchema]
});

ReminderSchema.index({ user: 1, detectedDate: 1 });

module.exports = mongoose.model("Reminder", ReminderSchema);
