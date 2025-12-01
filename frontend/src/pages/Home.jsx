// src/pages/Home.jsx
import React, { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/global.css";
import "../styles/home.css";
import heroImg from "../assets/hero.png";

export default function Home() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      window.location.href = "/dashboard";
    }
  }, [user]);

  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE || "http://localhost:3000/api"}/auth`;
  };

  return (
    <div className="home-page">
      <header className="home-nav container" id="home">
        <nav className="top-nav">
          <ul>
            <li><a href="#home" onClick={(e)=>{e.preventDefault(); window.location.href="/#home"}}>Home</a></li>
            <li><a href="#about" onClick={(e)=>{e.preventDefault(); if(window.location.pathname !== "/") return window.location.href = "/#about"; document.getElementById("about")?.scrollIntoView({behavior:"smooth"})}}>About Us</a></li>
            <li><a href="#inner" onClick={(e)=>{e.preventDefault(); if(window.location.pathname !== "/") return window.location.href = "/#inner"; document.getElementById("inner")?.scrollIntoView({behavior:"smooth"})}}>Inner Workings</a></li>
            <li><a href="#contact" onClick={(e)=>{e.preventDefault(); if(window.location.pathname !== "/") return window.location.href = "/#contact"; document.getElementById("contact")?.scrollIntoView({behavior:"smooth"})}}>Contact me!</a></li>
          </ul>
        </nav>
      </header>

      <main className="home-hero container">
        <section className="hero-left">
          <h1 className="hero-title">Smart-Reminder</h1>
          <p className="hero-desc">
            Auto-detect deadlines from your college emails — never miss an application.
            Keep all upcoming tasks organised, get timely reminders, and focus on applying.
          </p>

          <div className="hero-cta">
            <button className="pill-btn primary" onClick={handleLogin}>
              Login
            </button>

            <button
              className="pill-btn secondary"
              onClick={() => {
                window.location.href = `${import.meta.env.VITE_API_BASE || "http://localhost:3000/api"}/auth`;
              }}
            >
              Signup
            </button>
          </div>
        </section>

        <section className="hero-right">
          <img src={heroImg} alt="illustration" className="hero-image" />
        </section>
      </main>

      {/* About section */}
      <section id="about" className="site-section container">
        <div className="section-card">
          <h2>About Us</h2>
          <p>
            Smart-Reminder automatically detects deadlines and important dates from college emails,
            helping students stay organised and apply on time. By connecting your email,
            our system scans for relevant information and sets up reminders so you never miss out.
          </p>
        </div>
      </section>

      {/* Inner workings section */}
      <section id="inner" className="site-section container">
        <div className="section-card">
          <h2>Inner Workings</h2>
          <p>
            We use a combination of secure email parsing, NLP for extracting dates and events,
            and a lightweight reminder scheduler. All data is processed with privacy in mind,
            ensuring your information stays safe while you benefit from automated organisation.
          </p>
        </div>
      </section>

      {/* Contact section */}
      <section id="contact" className="site-section container">
        <div className="section-card">
          <h2>Contact me</h2>
          <p>
            Want to get in touch? Email: <a href="mailto:kkashyap27100@gmail.com">kkashyap27100@gmail.com</a>
          </p>
        </div>
      </section>
    </div>
  );
}
