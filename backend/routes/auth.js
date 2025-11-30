const express = require("express");
const dotenv = require("dotenv");
const { createOAuthClient } = require('../services/authServices');
const User = require("../models/User");

dotenv.config();
const router = express.Router();

router.get("/auth", (req, res) => {
  const client = createOAuthClient();
  const url = client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/gmail.readonly", "openid", "email", "profile"],
    prompt: "consent"
  });
  res.redirect(url);
});

router.get("/oauth2callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Missing code");

  try {
    const client = createOAuthClient();
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // extract user info from id_token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.create({
        googleId,
        email,
        name,
        picture,
        oauth: tokens
      });
    } else {
      user.oauth = tokens;
      user.name = name;
      user.picture = picture;
      await user.save();
    }

    req.session.userId = user._id.toString();

    // After backend login, redirect to frontend app dashboard route (adjust)
    res.redirect("http://localhost:5173/dashboard");
  } catch (err) {
    console.error("OAuth callback error:", err);
    res.status(500).send("OAuth error");
  }
});

router.get("/me", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
  const user = await User.findById(req.session.userId).select("-oauth.refresh_token");
  res.json(user);
});

module.exports = router;
