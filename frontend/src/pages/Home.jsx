import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles/global.css";
import "../styles/home.css";
import heroImg from "../assets/hero.png";
import { FiArrowRight } from "react-icons/fi";

export default function Home() {
  const { user } = useContext(AuthContext);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    if (user) {
      window.location.href = "/dashboard";
    }
  }, [user]);

  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE || "http://localhost:3000/api"}/auth`;
  };

  const features = [
    {
      icon: "📧",
      title: "Email Scanning",
      description: "Automatically scans your college emails for important deadlines and events"
    },
    {
      icon: "🤖",
      title: "Smart Detection",
      description: "AI-powered extraction of dates, companies, and application details"
    },
    // {
    //   icon: "🔔",
    //   title: "Timely Reminders",
    //   description: "Get notified before deadlines so you never miss an opportunity"
    // },
    {
      icon: "📅",
      title: "Organized Dashboard",
      description: "View all your tasks in one place with upcoming, completed, and missed sections"
    }
  ];

  const workingSteps = [
    {
      step: "1",
      title: "Connect Your Email",
      description: "Securely link your college email account through OAuth authentication"
    },
    {
      step: "2",
      title: "Automatic Scanning",
      description: "Our NLP engine scans and extracts relevant deadline information"
    },
    {
      step: "3",
      title: "Smart Organization",
      description: "All deadlines are automatically categorized and organized for you"
    },
    {
      step: "4",
      title: "Stay Updated",
      description: "Receive push notifications and never miss important dates"
    }
  ];

  return (
    <div className="home-page">
      <header className="home-nav" id="home">
        <div className="logo">Smart<span className="logo-accent">Reminder</span></div>
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
              Login with Google {FiArrowRight()}
            </button>
          </div>
        </section>

        <section className="hero-right">
          <img src={heroImg} alt="illustration" className="hero-image" />
        </section>
      </main>

      <section id="about" className="site-section about-section container">
        <div className="section-header">
          <h2 className="section-title">Why Smart-Reminder?</h2>
          <p className="section-subtitle">Never miss another college deadline with intelligent automation</p>
        </div>

        <div className="features-grid">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`feature-card ${activeFeature === idx ? 'active' : ''}`}
              onMouseEnter={() => setActiveFeature(idx)}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="inner" className="site-section workflow-section container">
        <div className="section-header">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Simple, secure, and automated</p>
        </div>

        <div className="workflow-timeline">
          {workingSteps.map((item, idx) => (
            <div key={idx} className="timeline-item">
              <div className="timeline-step">
                <div className="step-number">{item.step}</div>
                {idx < workingSteps.length - 1 && <div className="step-connector"></div>}
              </div>
              <div className="timeline-content">
                <h3 className="timeline-title">{item.title}</h3>
                <p className="timeline-desc">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="tech-stack">
          <p className="tech-label">Powered by</p>
          <div className="tech-badges">
            <span className="tech-badge">NLP</span>
            <span className="tech-badge">OAuth 2.0</span>
            <span className="tech-badge">Push Notifications</span>
            <span className="tech-badge">Email APIs</span>
          </div>
        </div>
      </section>

      <section id="contact" className="site-section contact-section container">
        <div className="contact-card">
          <div className="contact-content">
            <div className="contact-icon">💬</div>
            <h2 className="contact-title">Get In Touch</h2>
            <p className="contact-text">
              Have questions, feedback, or suggestions? I'd love to hear from you!
            </p>
            
            <div className="contact-methods">
              <a href="mailto:kkashyap27100@gmail.com" className="contact-method">
                <div className="method-icon">📧</div>
                <div className="method-details">
                  <div className="method-label">Email</div>
                  <div className="method-value">kkashyap27100@gmail.com</div>
                </div>
              </a>
            </div>

            <div className="contact-cta">
              <a href="mailto:kkashyap27100@gmail.com" className="pill-btn primary">
                Send Message
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}