const webPush = require("web-push");
const User = require("../models/User");

webPush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:example@example.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

async function saveSubscription(userId, subscription) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const exists = user.pushSubscriptions.some(
    (s) => s.endpoint === subscription.endpoint
  );
  if (!exists) {
    user.pushSubscriptions.push(subscription);
    await user.save();
  }
  return user.pushSubscriptions;
}

async function removeSubscription(userId, endpoint) {
  const user = await User.findById(userId);
  if (!user) return;
  user.pushSubscriptions = user.pushSubscriptions.filter(
    (s) => s.endpoint !== endpoint
  );
  await user.save();
}

async function sendPushToUser(user, payload) {
  const subs = user.pushSubscriptions || [];
  const promises = subs.map((s) =>
    webPush.sendNotification(s, JSON.stringify(payload)).catch((err) => {
      console.error("Push send error:", err.statusCode || err);
    })
  );
  await Promise.all(promises);
}

module.exports = {
  saveSubscription,
  removeSubscription,
  sendPushToUser
};
