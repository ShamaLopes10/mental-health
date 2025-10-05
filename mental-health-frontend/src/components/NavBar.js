// src/components/NavBar.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../contexts/authContext";

const NavBarWrapper = styled.header`
  width: 100%;
  padding: 1rem 2rem;
  background: #ffffffcc;
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
`;

const NavInner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Brand = styled.div`
  font-weight: 700;
  font-size: 1.6rem;
  color: rgb(199, 121, 190);
  cursor: pointer;
`;

const NavContainer = styled.div`
  display: flex;
  align-items: center;
`;

const MenuToggle = styled.div`
  display: none;
  font-size: 1.8rem;
  cursor: pointer;
  margin-left: 1rem;

  @media (max-width: 768px) {
    display: block;
  }
`;

const NavLinks = styled.nav`
  display: flex;
  gap: 1rem;

  @media (max-width: 768px) {
    position: absolute;
    top: 64px;
    right: 0;
    background: #ffffff;
    flex-direction: column;
    width: 220px;
    padding: 0 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-radius: 0 0 8px 8px;
    max-height: ${(props) => (props.open ? "500px" : "0")};
    overflow: hidden;
    transition: max-height 0.4s ease-in-out, padding 0.3s ease-in-out;
    padding: ${(props) => (props.open ? "1rem" : "0 1rem")};
  }
`;

const NavButton = styled.button`
  background: none;
  border: none;
  color: #333;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
  font-size: 1rem;

  &:hover {
    background: rgba(139, 75, 131, 1);
    color: white;
  }
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: 0.2s;

  &:hover {
    background: rgba(139, 75, 131, 1);
    color: white;
  }
`;

const ButtonLink = styled(NavLink)`
  background: rgb(199, 121, 190);
  color: white;

  &:hover {
    background: rgba(139, 75, 131, 1);
  }
`;

const NavBar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/"); // go back to landing page after logout
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false); // close mobile menu
  };

  return (
    <NavBarWrapper>
      <NavInner>
        <Brand onClick={() => (user ? navigate("/home") : scrollToSection("home"))}>
          MindSpace
        </Brand>

        <NavContainer>
          <MenuToggle onClick={() => setMenuOpen(!menuOpen)}>☰</MenuToggle>

          <NavLinks open={menuOpen}>
            {!user && (
              <>
                <NavButton onClick={() => scrollToSection("mission")}>Mission</NavButton>
                <NavButton onClick={() => scrollToSection("why")}>Why We Exist</NavButton>
                <NavButton onClick={() => scrollToSection("features")}>Features</NavButton>
                <NavButton onClick={() => scrollToSection("education")}>Education</NavButton>
                <NavButton onClick={() => scrollToSection("priorities")}>Priorities</NavButton>
                <ButtonLink to="/login">Login</ButtonLink>
                <ButtonLink to="/signup">Sign Up</ButtonLink>
              </>
            )}
            {user && (
              <>
                <NavLink to="/home" onClick={() => setMenuOpen(false)}>Home</NavLink>
                <NavLink to="/profile" onClick={() => setMenuOpen(false)}>My Profile</NavLink>
                <NavLink to="/tasks" onClick={() => setMenuOpen(false)}>Tasks</NavLink>
                <NavLink to="/resources" onClick={() => setMenuOpen(false)}>Resources</NavLink>
                <NavLink to="/chatbot" onClick={() => setMenuOpen(false)}>Chatbot</NavLink>
                <NavLink to="/log-mood" onClick={() => setMenuOpen(false)}>Log Mood</NavLink>
                <NavLink to="/" onClick={() => setMenuOpen(false)}>Landing Page</NavLink>
                <ButtonLink as="button" onClick={handleLogout}>Logout</ButtonLink>
              </>
            )}
          </NavLinks>
        </NavContainer>
      </NavInner>
    </NavBarWrapper>
  );
};

export default NavBar;
