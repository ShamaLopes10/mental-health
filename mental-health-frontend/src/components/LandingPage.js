import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import heroImage from "../assets/undraw_chatting_5u5z.svg"; // Add a relevant illustration in assets

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-wrapper">
      <header className="navbar">
        <h2 className="brand">MindSpace</h2>
        <nav>
          <button onClick={() => navigate("/login")}>Login</button>
          <button onClick={() => navigate("/signup")}>Sign Up</button>
        </nav>
      </header>

      <main className="landing-content">
        <section className="hero-section">
          <div className="hero-text">
            <h1>Your Personal Mental Health Companion</h1>
            <p>
              MindSpace is a personalized mental healthcare system designed to
              support your emotional well-being through chatbot conversations,
              peer support groups, curated resources, and mood-boosting tasks.
            </p>
            <p>
              Start your journey to better mental health. No judgment, just care.
            </p>
            <button className="get-started" onClick={() => navigate("/signup")}>
              Get Started
            </button>
          </div>
          <div className="hero-image">
            <img src={heroImage} alt="undraw_chatting_5u5z" />
          </div>
        </section>

        <section className="features-section">
          <h2>Why Choose MindSpace?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <span>💬</span>
              <h3>24/7 Chatbot Support</h3>
              <p>Talk anytime to our smart mental health companion trained to understand you.</p>
            </div>
            <div className="feature-card">
              <span>👥</span>
              <h3>Peer Support Groups</h3>
              <p>Join anonymous, moderated spaces to talk and share with others.</p>
            </div>
            <div className="feature-card">
              <span>📚</span>
              <h3>Curated Resources</h3>
              <p>Access articles, videos, and exercises tailored to your needs.</p>
            </div>
            <div className="feature-card">
              <span>🏆</span>
              <h3>Daily Well-being Tasks</h3>
              <p>Complete mood-boosting challenges and earn small rewards.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} MindSpace | All rights reserved</p>
      </footer>
    </div>
  );
};

export default LandingPage;
