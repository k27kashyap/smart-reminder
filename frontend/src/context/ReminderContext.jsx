import React, { createContext, useContext, useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

export const ReminderContext = createContext();

export function ReminderProvider({ children }) {
  const [tab, setTab] = useState("upcoming"); // upcoming | completed | missed
  const [reminders, setReminders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const perPage = 5;

  async function fetchReminders(selectedTab = tab, pageNum = page) {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/reminders?filter=${selectedTab}`);
      const all = res.data || [];
      setTotalPages(Math.max(1, Math.ceil(all.length / perPage)));
      const start = (pageNum - 1) * perPage;
      setReminders(all.slice(start, start + perPage));
    } catch (err) {
      console.error("fetchReminders error", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(1);
    fetchReminders(tab, 1);
  }, [tab]);

  useEffect(() => {
    fetchReminders(tab, page);
  }, [page]);

  return (
    <ReminderContext.Provider
      value={{
        tab,
        setTab,
        reminders,
        setReminders,
        page,
        setPage,
        totalPages,
        setTotalPages,
        loading,
        fetchReminders,
        perPage
      }}
    >
      {children}
    </ReminderContext.Provider>
  );
}

export function useReminders() {
  return useContext(ReminderContext);
}
