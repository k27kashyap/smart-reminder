import React, { useState } from "react";
import axiosClient from "../api/axiosClient";
import "../styles/modal.css";

export default function AddEditModal({ item = null, onClose, onSaved }) {
  const [title, setTitle] = useState(item?.subject || "");
  const [company, setCompany] = useState(item?.company || "");
  const [role, setRole] = useState(item?.role || "");
  const [date, setDate] = useState(item ? new Date(item.detectedDate).toISOString().slice(0, 16) : "");
  const [snippet, setSnippet] = useState(item?.snippet || "");
  const [links, setLinks] = useState((item?.links || []).join(", "));
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !date) {
      alert("Title and deadline are required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        subject: title,
        company,
        role,
        snippet,
        links: links.split(",").map((s) => s.trim()).filter(Boolean),
        detectedDate: new Date(date).toISOString()
      };

      if (item && item._id) {
        // Edit
        await axiosClient.put(`/reminders/${item._id}`, payload);
      } else {
        // Create
        await axiosClient.post("/reminders", payload);
      }

      // call parent callback to refresh lists
      if (typeof onSaved === "function") onSaved();
      else window.location.reload();

      onClose && onClose();
    } catch (err) {
      console.error("Save reminder error", err);
      alert("Failed to save reminder. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>{item ? "Edit Reminder" : "Add Reminder"}</h3>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>Title*</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />

          <label>Company</label>
          <input value={company} onChange={(e) => setCompany(e.target.value)} />

          <label>Role</label>
          <input value={role} onChange={(e) => setRole(e.target.value)} />

          <label>Deadline*</label>
          <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />

          <label>Description</label>
          <textarea value={snippet} onChange={(e) => setSnippet(e.target.value)} />

          <label>Links (comma separated)</label>
          <input value={links} onChange={(e) => setLinks(e.target.value)} />

          <div className="modal-actions">
            <button type="button" className="btn ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
