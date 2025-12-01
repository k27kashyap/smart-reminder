function normalizeSubject(subject = "") {
  return subject
    .toLowerCase()
    .replace(/^(re:|fwd:|fw:|updated list:)\s*/g, "")
    .trim();
}

function extractCompany(subject = "") {
  const norm = normalizeSubject(subject);
  const parts = norm.split(" - ");
  return (parts[0] || norm).toUpperCase();
}

function extractRole(subject = "") {
  const norm = normalizeSubject(subject);
  const parts = norm.split(" - ");
  if (parts.length >= 2) {
    return parts[1].trim();
  }
  return "General";
}

function extractLinks(text = "") {
  const regex = /(https?:\/\/[^\s"'<>]+)/g;
  const links = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    links.push(match[1]);
  }
  return [...new Set(links)];
}

module.exports = {
  normalizeSubject,
  extractCompany,
  extractRole,
  extractLinks
};
