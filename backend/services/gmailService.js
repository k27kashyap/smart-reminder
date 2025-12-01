const { google } = require("googleapis");
const chrono = require("chrono-node");
const {
  extractCompany,
  extractRole,
  extractLinks
} = require("../utils/dataParser");
const { getOAuthClientForUser } = require("./authServices");
const { upsertReminder } = require("./reminderService");

const ALLOWED_SENDERS = [
  "placement@vitap.ac.in",
  "helpdesk.cdc@vit.ac.in",
  "students.cdc2026@vitap.ac.in"
];

function collectTextFromPayload(payload) {
  let texts = [];

  function decodeBase64Url(str) {
    if (!str) return "";
    str = str.replace(/-/g, "+").replace(/_/g, "/");
    while (str.length % 4) str += "=";
    return Buffer.from(str, "base64").toString("utf-8");
  }

  function htmlToText(html) {
    if (!html) return "";
    html = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ");
    html = html.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ");
    html = html.replace(/<(br|p|div|li)[^>]*>/gi, "\n");
    html = html.replace(/<\/?[^>]+(>|$)/g, "");
    html = html.replace(/&nbsp;/gi, " ");
    html = html.replace(/&amp;/gi, "&");
    html = html.replace(/&lt;/gi, "<");
    html = html.replace(/&gt;/gi, ">");
    html = html.replace(/&quot;/gi, '"');
    html = html.replace(/\n{2,}/g, "\n");
    html = html.replace(/[ \t]{2,}/g, " ");
    return html.trim();
  }

  function walk(part) {
    if (!part) return;
    if (part.parts && part.parts.length) {
      for (const p of part.parts) walk(p);
    }

    const mime = (part.mimeType || "").toLowerCase();

    if (mime === "text/plain" && part.body && part.body.data) {
      const decoded = decodeBase64Url(part.body.data);
      texts.push(decoded);
    } else if (mime === "text/html" && part.body && part.body.data) {
      const decoded = decodeBase64Url(part.body.data);
      texts.push(htmlToText(decoded));
    } else if (!part.mimeType && part.body && part.body.data) {
      const decoded = decodeBase64Url(part.body.data);
      texts.push(decoded);
    }
  }

  walk(payload);

  return texts.join("\n\n").trim();
}

function simpleParseDateTime(text) {
  const results = chrono.parse(text || "");

  if (!results || results.length === 0) {
    return {
      detectedDate: null,
      dueDate: null,
      dueTime: null,
      noDueDate: true,
      noDueTime: true,
      matchedText: null,
      note: "No due date mentioned"
    };
  }

  let chosen = null;
  for (const r of results) {
    if (!r.start) continue;
    const known = r.start.knownValues || {};
    const hasDay = Object.prototype.hasOwnProperty.call(known, "day");
    if (!hasDay) continue;
    chosen = r;
    break;
  }

  if (!chosen) {
    return {
      detectedDate: null,
      dueDate: null,
      dueTime: null,
      noDueDate: true,
      noDueTime: true,
      matchedText: null,
      note: "No due date mentioned"
    };
  }

  const known = chosen.start.knownValues || {};
  let dateObj = chosen.start.date();
  const hasHour = Object.prototype.hasOwnProperty.call(known, "hour");
  const hasMinute = Object.prototype.hasOwnProperty.call(known, "minute");

  if (!hasHour && !hasMinute) {
    const yyyy = dateObj.getFullYear();
    const mm = dateObj.getMonth(); // zero-based
    const dd = dateObj.getDate();
    dateObj = new Date(yyyy, mm, dd, 23, 59, 0, 0);
  }

  const yyyy = dateObj.getFullYear();
  const mmStr = String(dateObj.getMonth() + 1).padStart(2, "0");
  const ddStr = String(dateObj.getDate()).padStart(2, "0");
  const dueDate = `${yyyy}-${mmStr}-${ddStr}`;

  const hhStr = String(dateObj.getHours()).padStart(2, "0");
  const miStr = String(dateObj.getMinutes()).padStart(2, "0");
  const dueTime = `${hhStr}:${miStr}`;

  return {
    detectedDate: dateObj,
    dueDate,
    dueTime,
    noDueDate: false,
    noDueTime: false,
    matchedText: chosen.text || null,
    note: null
  };
}

async function scanForUser(userId, options = {}) {
  const { client } = await getOAuthClientForUser(userId);

  const gmail = google.gmail({ version: "v1", auth: client });

  const qParts = [];
  qParts.push("newer_than:30d");
  if (options.unreadOnly) qParts.push("is:unread");
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
    const messageId =
      headers.find((h) => /message\-?id/i.test(h.name))?.value || msg.data.id;
    const snippet = msg.data.snippet || "";

    const fromLower = from.toLowerCase();
    if (!ALLOWED_SENDERS.some((s) => fromLower.includes(s.toLowerCase()))) {
      continue;
    }

    const bodyText = collectTextFromPayload(payload);
    const fullText = [subject, bodyText].filter(Boolean).join("\n\n");

    const parsed = simpleParseDateTime(fullText);

    const company = extractCompany(subject);
    const role = extractRole(subject);
    const links = extractLinks(fullText);

    const result = await upsertReminder(userId, {
      company,
      role,
      subject,
      snippet,
      sender: from,
      links,
      detectedDate: parsed.detectedDate,
      dueDate: parsed.dueDate,
      dueTime: parsed.dueTime,
      noDueDate: parsed.noDueDate,
      noDueTime: parsed.noDueTime,
      matchedText: parsed.matchedText,
      sourceMessageId: messageId,
      note: parsed.note || null
    });

    if (result.type === "created") created.push(result.reminder);
    else if (result.type === "updated") updated.push(result.reminder);
    else skippedCount++;
  }

  return { created, updated, skipped: skippedCount };
}

module.exports = {
  scanForUser
};

