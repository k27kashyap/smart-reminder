import React from "react";
import axiosClient from "../api/axiosClient";
import "../styles/modal.css";

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
    <div className="modal-overlay">
      <div className="modal-card">
        <h3>Delete Reminder</h3>
        <p>Are you sure you want to delete <strong>{item.company || item.subject}</strong>?</p>
        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>
    </div>
  );
}
