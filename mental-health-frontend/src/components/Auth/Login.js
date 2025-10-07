// src/components/Auth/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../contexts/authContext";
import loginbg from "../../assets/img/loginbg.jpg";

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please enter both email and password."); return; }

    try {
      await login(email, password);
      navigate("/home"); // redirect on success
    } catch (err) {
      setError(err.message); // show backend message if any
    }
  };

  return (
    <Wrapper>
      <Container>
        <FormSection>
          <FormWrapper>
            <h2>Welcome Back</h2>
            <p>Please login to continue</p>
            {error && <Error>{error}</Error>}

            <form onSubmit={handleLogin}>
              <InputWrapper>
                <span className="icon">📧</span>
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
              </InputWrapper>

              <InputWrapper>
                <span className="icon">🔒</span>
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
              </InputWrapper>

              <button type="submit">Login</button>

              <p>Don’t have an account? <a href="/signup">Register</a></p>
            </form>
          </FormWrapper>
        </FormSection>
        <ImageSection />
      </Container>
    </Wrapper>
  );
}

export default Login;

/* Styled components remain similar to your previous code */


// Styled Components
const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #e9ecef;
  padding: 6mm;
`;

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.15);
`;

const FormSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(180deg, #fdfdfd 0%, #f4f6f9 100%);
`;

const FormWrapper = styled.div`
  width: 80%;
  max-width: 380px;

  h2 {
    margin-bottom: 0.5rem;
    font-size: 2rem;
    color: var(--accent-dark);
  }

  p {
    margin-bottom: 2rem;
    color: #555;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  button {
    width: 100%;
    height: 50px;
    border: none;
    border-radius: 12px;
    background: var(--accent);
    color: #fff;
    font-size: 1rem;
    font-weight: 700;
    margin-top: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: var(--accent-dark);
      transform: translateY(-2px);
      box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
    }
  }

  p a {
    color: var(--violet);
    font-weight: bold;
    text-decoration: underline;
  }
`;

const ImageSection = styled.div`
  flex: 1.2;
  background: url(${loginbg}) no-repeat center center/cover;
`;

const InputWrapper = styled.div`
  position: relative;

  .icon {
    position: absolute;
    top: 50%;
    left: 14px;
    transform: translateY(-50%);
    color: var(--accent-dark);
  }

  input {
    width: 100%;
    height: 50px;
    padding: 0 1rem 0 2.8rem;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 12px;
    background: #fff;
    color: var(--muted);
    font-size: 1rem;
    outline: none;
    transition: border 0.2s, box-shadow 0.2s;
  }

  input:focus {
    border: 1px solid var(--accent);
    box-shadow: 0 0 0 2px rgba(113, 192, 187, 0.2);
  }
`;

const Options = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #555;

  a {
    color: var(--violet);
    font-weight: 600;
    text-decoration: none;
  }
`;

const Error = styled.div`
  background: rgba(255, 0, 0, 0.08);
  padding: 0.6rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: #b71c1c;
  border-left: 4px solid #d32f2f;
`;
