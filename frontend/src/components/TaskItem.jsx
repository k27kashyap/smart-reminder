import React, { useState } from "react";
import axiosClient from "../api/axiosClient";
import "../styles/taskitem.css";

export default function TaskItem({ reminder, onEdit, onDelete, onAction }) {
  const [expanded, setExpanded] = useState(false);
  const [processing, setProcessing] = useState(false);

  const isMissed = reminder.status === "missed";
  const isCompleted = reminder.status === "completed";

  // toggle complete/uncomplete
  const toggleComplete = async () => {
    if (isMissed) return;
    setProcessing(true);
    try {
      if (isCompleted) {
        // Uncomplete: call uncomplete endpoint
        await axiosClient.post(`/reminders/${reminder._id}/uncomplete`);
      } else {
        // Complete
        await axiosClient.post(`/reminders/${reminder._id}/complete`);
      }

      // Inform parent or reload
      if (typeof onAction === "function") onAction();
      else window.location.reload();
    } catch (err) {
      console.error("Toggle complete error", err);
      alert("Failed to update reminder. Try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this reminder?")) return;
    setProcessing(true);
    try {
      await axiosClient.delete(`/reminders/${reminder._1d || reminder._id}`);
      // call parent callback so it can refresh list
      if (typeof onDelete === "function") onDelete(reminder);
      else window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to delete reminder");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className={`task-card ${isMissed ? "missed" : ""} ${isCompleted ? "completed" : ""}`}>
      <div className="task-main">
        <div className="task-left" onClick={() => !processing && toggleComplete()}>
          <input type="checkbox" checked={isCompleted} readOnly disabled={processing || isMissed} />
        </div>

        <div className="task-body" onClick={() => setExpanded((s) => !s)}>
          <div className="task-top">
            <div className="task-title">{reminder.company || reminder.subject}</div>
            <div className="task-date">{new Date(reminder.detectedDate).toLocaleString()}</div>
          </div>

          {expanded && (
            <div className="task-expanded">
              <p className="task-snippet">{reminder.snippet}</p>
              {reminder.links && reminder.links.length > 0 && (
                <div className="links">
                  {reminder.links.map((l, idx) => (
                    <a key={idx} href={l} target="_blank" rel="noreferrer" className="link">
                      {l}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="task-actions">
          {!isMissed && (
            <button
              className="btn small"
              onClick={() => {
                if (typeof onEdit === "function") onEdit(reminder);
              }}
            >
              Edit
            </button>
          )}
          <button className="btn small danger" onClick={handleDelete} disabled={processing}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
