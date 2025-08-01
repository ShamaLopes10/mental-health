// src/components/Auth/Login.js
import React, { useState, useEffect } from "react"; // Added useEffect
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../contexts/authContext"; // VERIFY THIS PATH

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authContextLoading } = useAuth(); // Get login, isAuthenticated, and loading state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // useEffect to handle navigation AFTER authentication state is confirmed
  useEffect(() => {
    // console.log(`[Login.js] useEffect triggered: isAuthenticated=${isAuthenticated}, authContextLoading=${authContextLoading}`);
    // Only navigate if:
    // 1. The user is actually authenticated.
    // 2. The authentication process (in AuthContext) is no longer loading.
    // 3. We are not currently in the middle of a form submission (isSubmitting is false).
    //    This last check prevents potential navigation loops if login fails then quickly succeeds,
    //    or if the component re-renders for other reasons while still technically "submitting".
    if (isAuthenticated && !authContextLoading && !isSubmitting) {
      // console.log("[Login.js] useEffect: Navigating to /home as user is authenticated and context is not loading.");
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, authContextLoading, navigate, isSubmitting]); // Dependencies for the effect

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setIsSubmitting(true);
    try {
      // console.log("[Login.js] handleLogin: Calling await login()...");
      await login(email, password); // Call login from context
      // console.log("[Login.js] handleLogin: login() call finished. Navigation will be handled by useEffect.");
      // No direct navigation here; useEffect will handle it when isAuthenticated becomes true.
      // If login fails, an error will be thrown by auth.login() and caught below.
      // If login succeeds, AuthContext updates isAuthenticated, triggering the useEffect.
    } catch (err) {
      // console.error("[Login.js] handleLogin error:", err);
      const errorMsg =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.msg ||
        err.message ||
        "Login failed. Please check your credentials or try again later.";
      setError(errorMsg);
      // setIsSubmitting will be set to false in the finally block
    } finally {
      // Set isSubmitting to false here regardless of success or failure,
      // so the useEffect can make a clean decision if it runs again.
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <Form onSubmit={handleLogin}>
        <h1>Login</h1>
        {error && <Error>{error}</Error>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
          required
        />
        <button type="submit" disabled={isSubmitting || authContextLoading}> {/* Also disable if context is loading */}
          {isSubmitting || authContextLoading ? "Processing..." : "Login"}
        </button>
        <p>
          Don't have an account?{" "}
          <Link to="/signup" className="styled-link">Register</Link>
        </p>
      </Form>
    </Container>
  );
};

export default Login;

// Styled Components (remain the same)
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f6f1f1;
  padding: 1rem;
`;

const Form = styled.form`
  background-color: #afd3e2;
  padding: 2rem 3rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  color: #333333;

  h1 {
    margin-bottom: 1.5rem;
    text-align: center;
    color: #146c94;
    font-size: 2rem;
  }

  input {
    padding: 0.85rem;
    margin-bottom: 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 1rem;
    box-sizing: border-box;
    &:focus {
      outline: none;
      border-color: #19a7ce;
      box-shadow: 0 0 0 2px rgba(25, 167, 206, 0.2);
    }
  }

  button {
    padding: 0.85rem;
    background-color: #19a7ce;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-top: 0.5rem;

    &:hover {
      background-color: #146c94;
    }
    &:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  }

  p {
    margin-top: 1.5rem;
    font-size: 0.9rem;
    text-align: center;

    .styled-link {
      color: #19a7ce;
      cursor: pointer;
      text-decoration: none;
      font-weight: bold;

      &:hover {
        color: #146c94;
        text-decoration: underline;
      }
    }
  }
`;

const Error = styled.div`
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef9a9a;
  border-left: 4px solid #d32f2f;
  padding: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  border-radius: 4px;
`;