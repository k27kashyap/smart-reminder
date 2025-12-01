// import React, { useState } from "react";
// import { FiEdit, FiTrash2 } from "react-icons/fi";
// import axiosClient from "../api/axiosClient";
// import "../styles/taskitem.css";

// export default function TaskItem({ reminder, onEdit, onDelete, onAction }) {
//   const [expanded, setExpanded] = useState(false);
//   const [processing, setProcessing] = useState(false);

//   const isMissed = reminder?.status === "missed";
//   const isCompleted = reminder?.status === "completed";

//   // helper to get display date/time
//   function getDisplayDate(rem) {
//     if (!rem) return "No due date";
//     if (rem.dueDate) {
//       return rem.dueTime ? `${rem.dueDate}, ${rem.dueTime}` : `${rem.dueDate}, 23:59`;
//     }
//     if (rem.detectedDate) {
//       try {
//         const d = new Date(rem.detectedDate);
//         if (!isNaN(d.getTime())) return d.toLocaleString();
//       } catch (e){ /* ignore */ }
//     }
//     return "No due date";
//   }

//   const toggleComplete = async (e) => {
//     if (e && e.stopPropagation) e.stopPropagation();

//     if (isMissed) return;
//     setProcessing(true);
//     try {
//       const id = reminder?._id;
//       if (!id) throw new Error("Missing reminder id");

//       if (isCompleted) {
//         await axiosClient.post(`/reminders/${id}/uncomplete`);
//       } else {
//         await axiosClient.post(`/reminders/${id}/complete`);
//       }

//       if (typeof onAction === "function") onAction();
//       else window.location.reload();
//     } catch (err) {
//       console.error("Toggle complete error", err);
//       alert("Failed to update reminder. Try again.");
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handleDelete = async (e) => {
//     e.stopPropagation();
//     if (!confirm("Delete this reminder?")) return;
//     setProcessing(true);
//     try {
//       const id = reminder?._id;
//       if (!id) throw new Error("Missing reminder id");

//       await axiosClient.delete(`/reminders/${id}`);
//       // call parent callback so it can refresh list
//       if (typeof onDelete === "function") onDelete(reminder);
//       else window.location.reload();
//     } catch (err) {
//       console.error(err);
//       alert("Failed to delete reminder");
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handleEdit = (e) => {
//     e.stopPropagation();
//     if (typeof onEdit === "function") onEdit(reminder);
//   };

//   const handleExpand = (e) => {
//     if (e && e.stopPropagation) e.stopPropagation();
//     setExpanded((s) => !s);
//   };

//   const onKeyDownExpand = (e) => {
//     if (e.key === "Enter" || e.key === " ") {
//       e.preventDefault();
//       handleExpand(e);
//     }
//   };

//   const displayDate = getDisplayDate(reminder);

//   return (
//     <div
//       className={`task-card ${isMissed ? "missed" : ""} ${isCompleted ? "completed" : ""}`}
//     >
//       <div className="task-main">

//         {/* CHECKBOX area (separate clickable zone) */}
//         <div
//           className="task-left"
//           onClick={(e) => {
//             if (processing) {
//               e.stopPropagation();
//               return;
//             }
//             toggleComplete(e);
//           }}
//         >
//           <label className="checkbox-wrap" onClick={(e) => e.stopPropagation()}>
//             <input
//               type="checkbox"
//               className="task-checkbox"
//               checked={!!isCompleted}
//               onChange={toggleComplete}
//               disabled={processing || isMissed}
//               aria-label={isCompleted ? "Mark uncomplete" : "Mark complete"}
//             />
//             <span className="custom-check">{/* checkmark handled by CSS via :checked */}</span>
//           </label>
//         </div>

//         {/* INTERACTIVE AREA — clicking/keyboard expands. Edit/Delete and checkbox do not trigger expand */}
//         <div
//           className="task-body"
//           onClick={handleExpand}
//           role="button"
//           tabIndex={0}
//           onKeyDown={onKeyDownExpand}
//         >
//           <div className="task-top">
//             <div className="task-left-block">
//               <div className="task-title">{reminder.company || reminder.subject}</div>
//               {/* show snippet */}
//               {expanded ? (
//                 <div className="task-expanded">
//                   <p className="task-snippet">{reminder.snippet}</p>

//                   {reminder.links && reminder.links.length > 0 && (
//                     <div className="links">
//                       {reminder.links.map((l, idx) => (
//                         <a
//                           key={idx}
//                           href={l}
//                           target="_blank"
//                           rel="noreferrer"
//                           className="link"
//                           onClick={(e) => e.stopPropagation()}
//                         >
//                           {l}
//                         </a>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               ) : null}
//             </div>

//             {/* META + ACTIONS (not part of interactive hover/expand) */}
//             <div className="task-actions" onClick={(e) => e.stopPropagation()}>
//               <div className="task-date" style={{ marginBottom: 8 }}>{displayDate}</div>

//               {!isMissed && (
//                 <button
//                   className="icon-btn"
//                   onClick={handleEdit}
//                   title="Edit"
//                   aria-label="Edit reminder"
//                 >
//                   <FiEdit size={18} />
//                 </button>
//               )}

//               <button
//                 className="icon-btn danger"
//                 onClick={handleDelete}
//                 disabled={processing}
//                 title="Delete"
//                 aria-label="Delete reminder"
//               >
//                 <FiTrash2 size={18} />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import axiosClient from "../api/axiosClient";
import "../styles/taskitem.css";

export default function TaskItem({ reminder, onEdit, onDelete, onAction }) {
  const [expanded, setExpanded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const isMissed = reminder?.status === "missed";
  const isCompleted = reminder?.status === "completed";

  function getDisplayDate(rem) {
    if (!rem) return "No due date";
    if (rem.dueDate) {
      return rem.dueTime ? `${rem.dueDate}, ${rem.dueTime}` : `${rem.dueDate}, 23:59`;
    }
    if (rem.detectedDate) {
      try {
        const d = new Date(rem.detectedDate);
        if (!isNaN(d.getTime())) return d.toLocaleString();
      } catch (e){ }
    }
    return "No due date";
  }

  const toggleComplete = async (e) => {
    if (e && e.stopPropagation) e.stopPropagation();

    if (isMissed || isAnimating) return;
    
    setIsAnimating(true);
    setProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const id = reminder?._id;
      if (!id) throw new Error("Missing reminder id");

      if (isCompleted) {
        await axiosClient.post(`/reminders/${id}/uncomplete`);
      } else {
        await axiosClient.post(`/reminders/${id}/complete`);
      }

      if (typeof onAction === "function") onAction();
      else window.location.reload();
    } catch (err) {
      console.error("Toggle complete error", err);
      alert("Failed to update reminder. Try again.");
      setIsAnimating(false);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm("Delete this reminder?")) return;
    setProcessing(true);
    try {
      const id = reminder?._id;
      if (!id) throw new Error("Missing reminder id");

      await axiosClient.delete(`/reminders/${id}`);
      if (typeof onDelete === "function") onDelete(reminder);
      else window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to delete reminder");
    } finally {
      setProcessing(false);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (typeof onEdit === "function") onEdit(reminder);
  };

  const handleExpand = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setExpanded((s) => !s);
  };

  const onKeyDownExpand = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleExpand(e);
    }
  };

  const displayDate = getDisplayDate(reminder);

  return (
    <div
      className={`task-card ${isMissed ? "missed" : ""} ${isCompleted ? "completed" : ""} ${isAnimating ? "completing" : ""}`}
    >
      <div className="task-main">

        <div
          className="task-left"
          onClick={(e) => {
            if (processing) {
              e.stopPropagation();
              return;
            }
            toggleComplete(e);
          }}
        >
          <label className="checkbox-wrap" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              className="task-checkbox"
              checked={!!isCompleted}
              onChange={toggleComplete}
              disabled={processing || isMissed}
              aria-label={isCompleted ? "Mark uncomplete" : "Mark complete"}
            />
            <span className="custom-check"></span>
          </label>
        </div>

        <div
          className="task-body"
          onClick={handleExpand}
          role="button"
          tabIndex={0}
          onKeyDown={onKeyDownExpand}
        >
          <div className="task-top">
            <div className="task-left-block">
              <div className="task-title">{reminder.company || reminder.subject}</div>
              {expanded ? (
                <div className="task-expanded">
                  <p className="task-snippet">{reminder.snippet}</p>

                  {reminder.links && reminder.links.length > 0 && (
                    <div className="links">
                      {reminder.links.map((l, idx) => (
                        <a
                          key={idx}
                          href={l}
                          target="_blank"
                          rel="noreferrer"
                          className="link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {l}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="task-actions" onClick={(e) => e.stopPropagation()}>
              <div className="task-date" style={{ marginBottom: 8 }}>{displayDate}</div>

              {!isMissed && (
                <button
                  className="icon-btn"
                  onClick={handleEdit}
                  title="Edit"
                  aria-label="Edit reminder"
                >
                  <FiEdit size={18} />
                </button>
              )}

              <button
                className="icon-btn danger"
                onClick={handleDelete}
                disabled={processing}
                title="Delete"
                aria-label="Delete reminder"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}