const mongoose = require("mongoose");

const HistorySchema = new mongoose.Schema(
  {
    detectedDate: Date,
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

  detectedDate: { type: Date, required: true },
  sourceMessageId: String,
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
