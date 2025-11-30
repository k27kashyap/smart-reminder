const { google } = require("googleapis");
const User = require("../models/User");

function createOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

async function getOAuthClientForUser(userId) {
  const user = await User.findById(userId);
  if (!user || !user.oauth) throw new Error("User or OAuth tokens not found");

  const client = createOAuthClient();
  client.setCredentials({
    access_token: user.oauth.access_token,
    refresh_token: user.oauth.refresh_token,
    scope: user.oauth.scope,
    token_type: user.oauth.token_type,
    expiry_date: user.oauth.expiry_date
  });

  // googleapis will auto-refresh if refresh_token present
  return { client, user };
}

module.exports = {
  createOAuthClient,
  getOAuthClientForUser
};
