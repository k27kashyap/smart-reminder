import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/navbar.css";

const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About Us" },
  { id: "inner", label: "Inner Workings" },
  { id: "contact", label: "Contact me!" },
];

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  const handleNavClick = (id) => (e) => {
    e.preventDefault();

    if (window.location.pathname !== "/") {
      window.location.href = `/${id ? `#${id}` : ""}`;
      return;
    }

    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      if (id) window.location.hash = `#${id}`;
    }
  };

  return (
    <header className="nav-root">
      <div className="nav-left">
        <div className="logo">Smart<span className="logo-accent">Reminder</span></div>

        <nav className="site-nav" aria-label="Main navigation">
          <ul>
            {NAV_ITEMS.map((n) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  className="nav-link"
                  onClick={handleNavClick(n.id)}
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
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
