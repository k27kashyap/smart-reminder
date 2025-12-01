import React, { useContext, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import { AuthContext } from "./context/AuthContext";

function RequireAuth({ children }) {
  const { user, loadingUser } = useContext(AuthContext);
  const location = useLocation();

  if (loadingUser) return <div style={{ padding: 40 }}>Loading...</div>;
  if (!user) return <Navigate to="/" state={{ from: location }} replace />;

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
