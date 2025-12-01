import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/navbar.css";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="nav-root">
      <div className="nav-left">
        <div className="logo">Smart<span className="logo-accent">Reminder</span></div>

        <nav className="site-nav" aria-label="Main navigation"></nav>
      </div>

      <div className="nav-right">
        {user ? (
          <div className="user-menu" tabIndex={0} aria-haspopup="true">
            <img src={user.picture} className="avatar" alt={user.name || "user"} />
            <div className="dropdown" role="menu">
              <div className="dropdown-item" role="menuitem">{user.name}</div>
              <div className="dropdown-item" role="menuitem" onClick={logout}>Logout</div>
            </div>
          </div>
        ) : (
          <button
            className="btn primary"
            onClick={() => (window.location.href = `${import.meta.env.VITE_API_BASE}/auth`)}
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}
