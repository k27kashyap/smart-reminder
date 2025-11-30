const mongoose = require("mongoose");

const PushSubscriptionSchema = new mongoose.Schema(
  {
    endpoint: String,
    keys: {
      p256dh: String,
      auth: String
    }
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  name: String,
  picture: String,
  oauth: {
    access_token: String,
    refresh_token: String,
    scope: String,
    token_type: String,
    expiry_date: Number
  },
  preferences: {
    scanUnreadOnly: { type: Boolean, default: false },
    notifyOffsetsSeconds: {
      type: [Number],
      default: [7 * 24 * 3600, 3 * 24 * 3600, 24 * 3600, 2 * 3600]
    }
  },
  pushSubscriptions: [PushSubscriptionSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);
