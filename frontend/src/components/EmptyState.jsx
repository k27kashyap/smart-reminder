import React from "react";

export default function EmptyState() {
  return (
    <div style={{ padding: 40, textAlign: "center", color: "#777" }}>
      <h3>No reminders</h3>
      <p>Click "Rescan" to fetch latest emails or add a custom task.</p>
    </div>
  );
}
