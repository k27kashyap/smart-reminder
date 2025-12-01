import React from "react";
import TaskItem from "./TaskItem";
import EmptyState from "./EmptyState";

export default function TaskList({ reminders, onEdit, onDelete, onAction }) {
  if (!reminders || reminders.length === 0) return <EmptyState />;

  return (
    <div className="task-list">
      {reminders.map((r) => (
        <TaskItem
          key={r._id}
          reminder={r}
          onEdit={onEdit}
          onDelete={onDelete}
          onAction={onAction}
        />
      ))}
    </div>
  );
}