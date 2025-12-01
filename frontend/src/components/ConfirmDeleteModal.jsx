import React from "react";
import axiosClient from "../api/axiosClient";
import "../styles/delete.css";

export default function ConfirmDeleteModal({ item, onClose, onDeleted }) {
  const handleDelete = async () => {
    try {
      await axiosClient.delete(`/reminders/${item._id}`);
      if (onDeleted) onDeleted();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card delete-confirm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon delete-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
          </svg>
        </div>
        <h3 className="modal-title">Delete Reminder?</h3>
        <p className="modal-text">
          Are you sure you want to delete <strong>{item.company || item.subject}</strong>? This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>
    </div>
  );
}