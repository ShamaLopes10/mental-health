// src/components/LandingPage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import heroBg from "../assets/img/bg.jpg";
import whyImg from "../assets/img/whyweexist1.webp";
import "./LandingPage.css";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { useAuth } from "../contexts/authContext";

const letters = "MINDSPACE".split("");

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value || "Anonymous";
    const email = form.email.value || "no-reply";
    const message = form.message.value || "";
    const subject = encodeURIComponent(`MindSpace contact from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:hello@mindspace.example?subject=${subject}&body=${body}`;
  };

  return (
    <div
      className="landing-root"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* NAVBAR
      <header className="nav">
        <div className="nav-inner">
          <div className="brand" onClick={() => (user ? navigate("/home") : scrollToId("home"))}>
            MindSpace
          </div>
          <nav className="nav-links">
            {!user && (
              <>
                <button className="nav-link" onClick={() => scrollToId("mission")}>
                  Mission
                </button>
                <button className="nav-link" onClick={() => scrollToId("why")}>
                  Why We Exist
                </button>
                <button className="nav-link" onClick={() => scrollToId("features")}>
                  Features
                </button>
                <button className="nav-link" onClick={() => scrollToId("education")}>
                  Education
                </button>
                <button className="nav-link" onClick={() => scrollToId("priorities")}>
                  Priorities
                </button>
                <button className="nav-link cta" onClick={() => navigate("/login")}>
                  Login
                </button>
                <button className="nav-link cta-outline" onClick={() => navigate("/signup")}>
                  Sign Up
                </button>
              </>
            )}
            {user && (
              <>
                <button className="nav-link" onClick={() => navigate("/home")}>
                  Home
                </button>
                <button className="nav-link" onClick={() => navigate("/profile")}>
                  My Profile
                </button>
                <button className="nav-link" onClick={() => navigate("/tasks")}>
                  Tasks
                </button>
                <button className="nav-link" onClick={() => navigate("/resources")}>
                  Resources
                </button>
                <button className="nav-link" onClick={() => navigate("/chatbot")}>
                  Chatbot
                </button>
                <button className="nav-link" onClick={() => navigate("/log-mood")}>
                  Log Mood
                </button>
                <button className="nav-link" onClick={() => navigate("/")}>
                  Landing Page
                </button>
              </>
            )}
          </nav>
        </div>
      </header> 

      {/* HERO */}
      <section id="home" className="hero">
        <div className="hero-left">
          <h1 className="app-title" aria-label="MINDSPACE">
            {letters.map((l, i) => (
              <span
                className="title-letter"
                key={i}
                style={{ "--i": i }}
              >
                {l}
              </span>
            ))}
          </h1>
          <h2 className="subtitle">Your Personal Mental Health Companion</h2>
          <p className="hero-desc">
            MindSpace is a personalized mental healthcare system designed to support your
            emotional well-being. Start improving your mental health and well-being today —
            MindSpace shows you how.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate("/signup")}>
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section id="mission" className="section mission">
        <div className="container">
          <h3 className="section-heading">Our Mission</h3>
          <p>
            MindSpace empowers people to better understand and manage their mental health by
            blending evidence-based psychoeducation, accessible self-help tools, and compassionate
            digital support. We believe early awareness, learning, and community reduce stigma and
            open pathways to care. Through data-informed personalization and human-centered design,
            our mission is to make effective mental health resources available to everyone,
            everywhere — helping people build resilience, coping skills, and hope.
          </p>
          <p>
            We prioritize safety, transparency, and dignity — delivering tools that guide users toward
            real-world help when needed, while supporting daily wellbeing practices that prevent
            deterioration and promote growth.
          </p>
        </div>
      </section>

      {/* WHY WE EXIST */}
      <section id="why" className="section why">
        <div className="container two-column">
          <div className="column text">
            <h3 className="section-heading">Why We Exist</h3>
            <p>
              Modern life brings unprecedented stressors and complexity; many people face barriers
              to care including stigma, limited access, and long waiting lists. MindSpace exists to
              bridge that gap — providing scalable, respectful, and immediate support that complements
              traditional services. We design interventions to detect changes early, educate users,
              and connect them to appropriate help when necessary.
            </p>
            <p>
              By combining proven psychoeducation, mood-tracking, supportive peer spaces, and
              an empathetic conversational assistant, MindSpace aims to make mental health care
              proactive and inclusive — so everyone has tools to stay well and recover when needed.
            </p>
          </div>
          <div className="column image">
            <img src={whyImg} alt="Why we exist" />
          </div>
        </div>
      </section>

      {/* FEATURES / WHY CHOOSE */}
      <section id="features" className="section features">
        <div className="container">
          <h3 className="section-heading">Why Choose MindSpace?</h3>
          <div className="cards-grid">
            <div className="card">
              <div className="card-icon">💬</div>
              <h4>24/7 Chatbot Support</h4>
              <p>An empathetic AI companion offering CBT-style support and mood-aware suggestions.</p>
            </div>
            <div className="card">
              <div className="card-icon">👥</div>
              <h4>Peer Support Groups</h4>
              <p>Safe, moderated anonymous groups that foster connection and reduce isolation.</p>
            </div>
            <div className="card">
              <div className="card-icon">📚</div>
              <h4>Curated Resources</h4>
              <p>Evidence-based articles, videos, and exercises personalized for your needs.</p>
            </div>
            <div className="card">
              <div className="card-icon">🏆</div>
              <h4>Daily Well-being Tasks</h4>
              <p>Small, science-backed tasks and feedback to build healthy habits and resilience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* EDUCATION / CDC */}
      <section id="education" className="section education">
        <div className="container">
          <h3 className="section-heading">Why Mental Health Education Is Important</h3>
        </div>
        <div className="container education-grid">
          <div className="edu-text">
            <blockquote className="edu-quote">
              “Teaching mental health lessons in school can reduce stigma and improve students’
              knowledge and attitudes about mental health. Students are also more likely to ask for help.”
            </blockquote>
            <p className="edu-source">Center for Disease Control and Prevention</p>
            <p>
              According to the CDC, a mental health education program should include:
            </p>
            <ul className="edu-list">
              <li>Teaching about mental health, emotional distress, and causes & symptoms of illnesses.</li>
              <li>Describing stigma and practical ways to reduce it.</li>
              <li>Emphasizing that mental illnesses are treatable and recovery is possible.</li>
              <li>Encouraging help-seeking and trusted adult conversations.</li>
            </ul>
            <p className="edu-cta">Get started with MindSpace — learn, practice, and reach out.</p>
          </div>
        </div>
      </section>

      {/* PRIORITIES */}
      <section id="priorities" className="section priorities">
        <div className="container">
          <h3 className="section-heading">Our Top Priorities</h3>
          <p className="small-lead">
            To reduce mental health struggles and increase mental fortitude in children, youth, and adults
            through evidence-based practices.
          </p>

          <div className="priority-grid">
            <div className="priority-card" tabIndex="0">
              <h4>Empower</h4>
              <p className="reveal">Through knowledge, the courage to imagine, and practical skills.</p>
            </div>
            <div className="priority-card" tabIndex="0">
              <h4>Create</h4>
              <p className="reveal">Design and deliver high-quality mental health education programs.</p>
            </div>
            <div className="priority-card" tabIndex="0">
              <h4>Combat & Prevent</h4>
              <p className="reveal">Reduce incidence of mental illness through early intervention and support.</p>
            </div>
            <div className="priority-card" tabIndex="0">
              <h4>Foster</h4>
              <p className="reveal">Build peer support and strengthen community engagement.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="section contact">
        <div className="container contact-grid">
          <div className="contact-form">
            <h3 className="section-heading">Contact Us</h3>
            <form onSubmit={handleContactSubmit}>
              <label>
                Name
                <input name="name" type="text" placeholder="Your name" required />
              </label>
              <label>
                Email
                <input name="email" type="email" placeholder="you@example.com" required />
              </label>
              <label>
                Message
                <textarea name="message" rows="5" placeholder="How can we help?" required />
              </label>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Send Message</button>
                <button type="reset" className="btn-secondary">Reset</button>
              </div>
            </form>
          </div>

          <div className="contact-info">
            <h4>Reach us</h4>
            <p>Email: <a href="mailto:hello@mindspace.example">hello@mindspace.example</a></p>
            <div className="socials">
              <a href="https://instagram.com/yourusername" target="_blank" rel="noreferrer">
                <FaInstagram size={30} color="#E1306C" />
              </a>
              <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noreferrer">
                <FaLinkedin size={30} color="#0A66C2" />
              </a>
            </div>
            <p className="small-note">Follow us for updates, resources, and community events.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>© 2025 MindSpace | All rights reserved</p>
      </footer>
    </div>
  );
};

export default LandingPage;
