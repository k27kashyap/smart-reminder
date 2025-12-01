import React, { createContext, useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  async function fetchUser() {
    try {
      setLoadingUser(true);
      const res = await axiosClient.get("/me");
      setUser(res.data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  async function logout() {
    // clear session on backend by calling a logout endpoint if you implement one,
    // or just clear local state and redirect to home.
    try {
      await axiosClient.post("/auth/logout").catch(() => {});
    } catch (e) {}
    setUser(null);
    window.location.href = "/";
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loadingUser, fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
