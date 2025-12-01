const cron = require("node-cron");
const Reminder = require("../models/Reminder");
const User = require("../models/User");
const { sendPushToUser } = require("../services/pushService");
const { markMissedWherePast } = require("../services/reminderService");

function startScheduler() {
  console.log("Scheduler started");

  cron.schedule("* * * * *", async () => {
    const now = new Date();

    try {
      await markMissedWherePast();

      const users = await User.find({ "pushSubscriptions.0": { $exists: true } });

      for (const user of users) {
        const offsets = user.preferences.notifyOffsetsSeconds || [];
        if (offsets.length === 0) continue;

        const windowStart = new Date(now.getTime() - 60 * 1000);
        const windowEnd = now;

        const orConditions = offsets.map((sec) => {
          const targetStart = new Date(windowStart.getTime() + sec * 1000);
          const targetEnd = new Date(windowEnd.getTime() + sec * 1000);
          return {
            detectedDate: { $gte: targetStart, $lt: targetEnd }
          };
        });

        const reminders = await Reminder.find({
          user: user._id,
          status: "upcoming",
          $or: orConditions
        });

        for (const r of reminders) {
          const payload = {
            type: "reminder",
            title: r.company || r.subject,
            body: `${r.role || ""} — due at ${r.detectedDate.toLocaleString()}`,
            reminderId: r._id
          };

          await sendPushToUser(user, payload);
        }
      }
    } catch (err) {
      console.error("Scheduler error:", err);
    }
  });
}

module.exports = startScheduler;
