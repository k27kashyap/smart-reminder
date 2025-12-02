import React, { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Tabs from "../components/Tabs";
import TaskList from "../components/TaskList";
import Pagination from "../components/Pagination";
import AddEditModal from "../components/AddEditModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import Loader from "../components/Loader";
import { ReminderContext } from "../context/ReminderContext";
import axiosClient from "../api/axiosClient";
import "../styles/dashboard.css";

export default function Dashboard() {
  const { tab, setTab, reminders, page, setPage, totalPages, loading, fetchReminders } =
    useContext(ReminderContext);

  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  useEffect(() => {
    // register service worker from site root (public/sw.js -> dist/sw.js in production)
    if ("serviceWorker" in navigator && import.meta.env.VITE_VAPID_PUBLIC_KEY) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(async (reg) => {
          console.log("SW registered", reg);
          try {
            const sub = await reg.pushManager.getSubscription();
            if (!sub) {
              const permission = await Notification.requestPermission();
              if (permission === "granted") {
                const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
                const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
                const newSub = await reg.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: convertedKey
                });
                await axiosClient.post("/push/register", { subscription: newSub });
                console.log("Push subscription registered with backend");
              } else {
                console.log("Push permission not granted");
              }
            } else {
              console.log("Existing push subscription found");
            }
          } catch (err) {
            console.error("Push subscribe error", err);
          }
        })
        .catch((err) => {
          console.warn("Service worker registration failed:", err);
        });
    }

    function urlBase64ToUint8Array(base64String) {
      const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }
    // empty deps: run once on mount
  }, []);

  const handleScan = async () => {
    try {
      await axiosClient.post("/scan", { unreadOnly: false });
      fetchReminders(tab, page);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTaskAction = () => {
    fetchReminders(tab, page);
  };

  return (
    <div className="dashboard-root">
      <Navbar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <Tabs active={tab} onChange={(t) => { setTab(t); setPage(1); }} />
          <div className="actions">
            <button className="btn secondary" onClick={handleScan}>Rescan Emails</button>
            <button className="btn primary" onClick={() => setShowAdd(true)}>+ Add</button>
          </div>
        </div>

        <div className="dashboard-content">
          {loading ? <Loader /> : (
            <>
              <TaskList
                reminders={reminders}
                onEdit={(r) => setEditItem(r)}
                onDelete={(r) => setDeleteItem(r)}
                onAction={handleTaskAction}
              />

              <Pagination
                page={page}
                totalPages={totalPages}
                onPrev={() => setPage(Math.max(1, page - 1))}
                onNext={() => setPage(Math.min(totalPages, page + 1))}
              />
            </>
          )}
        </div>
      </main>

      {showAdd && <AddEditModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); fetchReminders(tab, page); }} />}
      {editItem && <AddEditModal item={editItem} onClose={() => setEditItem(null)} onSaved={() => { setEditItem(null); fetchReminders(tab, page); }} />}
      {deleteItem && <ConfirmDeleteModal item={deleteItem} onClose={() => setDeleteItem(null)} onDeleted={() => { setDeleteItem(null); fetchReminders(tab, page); }} />}
    </div>
  );
}
