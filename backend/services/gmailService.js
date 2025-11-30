const { google } = require("googleapis");
const chrono = require("chrono-node");
const {
  extractCompany,
  extractRole,
  extractLinks
} = require("../utils/dataParser");
const { getOAuthClientForUser } = require("./authServices");
const { upsertReminder } = require("./reminderService");

// configure senders per user later; for now hard-coded
const ALLOWED_SENDERS = [
  "placement@vitap.ac.in",
  "helpdesk.cdc@vit.ac.in",
  "students.cdc2026@vitap.ac.in"
];

async function scanForUser(userId, options = {}) {
  const { client } = await getOAuthClientForUser(userId);

  const gmail = google.gmail({ version: "v1", auth: client });

  const qParts = [];
  qParts.push("newer_than:30d");
  if (options.unreadOnly) qParts.push("is:unread");
  // add from filters
  const fromQuery = ALLOWED_SENDERS.map((s) => `from:${s}`).join(" OR ");
  qParts.push(`(${fromQuery})`);

  const query = qParts.join(" ");

  const listRes = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: 50
  });

  const messages = listRes.data.messages || [];
  if (messages.length === 0) return { created: [], updated: [], skipped: 0 };

  const details = await Promise.all(
    messages.map((m) =>
      gmail.users.messages.get({
        userId: "me",
        id: m.id,
        format: "full"
      })
    )
  );

  const created = [];
  const updated = [];
  let skippedCount = 0;

  for (const msg of details) {
    const payload = msg.data.payload || {};
    const headers = payload.headers || [];
    const subject =
      headers.find((h) => h.name === "Subject")?.value || "(no subject)";
    const from = headers.find((h) => h.name === "From")?.value || "";
    const messageId = headers.find((h) => h.name === "Message-ID")?.value || msg.data.id;
    const snippet = msg.data.snippet || "";

    // quick sender check (case-insensitive)
    const fromLower = from.toLowerCase();
    if (!ALLOWED_SENDERS.some((s) => fromLower.includes(s.toLowerCase()))) {
      continue;
    }

    // decode body (plain text parts)
    let bodyText = "";
    if (payload.parts && payload.parts.length > 0) {
      for (const part of payload.parts) {
        if (
          part.mimeType === "text/plain" &&
          part.body &&
          part.body.data
        ) {
          bodyText += Buffer.from(part.body.data, "base64").toString("utf-8");
        }
      }
    } else if (payload.body && payload.body.data) {
      bodyText = Buffer.from(payload.body.data, "base64").toString("utf-8");
    }

    const fullText = subject + "\n" + bodyText;

    const parsedDates = chrono.parse(fullText, new Date());
    if (!parsedDates || parsedDates.length === 0) {
      continue;
    }

    const company = extractCompany(subject);
    const role = extractRole(subject);
    const links = extractLinks(fullText);

    for (const p of parsedDates) {
      const detectedDate = p.start.date();

      const result = await upsertReminder(userId, {
        company,
        role,
        subject,
        snippet,
        sender: from,
        links,
        detectedDate,
        sourceMessageId: messageId
      });

      if (result.type === "created") created.push(result.reminder);
      else if (result.type === "updated") updated.push(result.reminder);
      else skippedCount++;
    }
  }

  return { created, updated, skipped: skippedCount };
}

module.exports = {
  scanForUser
};
