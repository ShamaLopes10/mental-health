// src/components/Auth/Signup.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FaUser, FaLock, FaEnvelope, FaGoogle } from "react-icons/fa";
import loginbg from "../../assets/img/loginbg.jpg";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill out all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
    const res = await axios.post("http://localhost:5001/api/auth/register", {
      username: name, // backend expects username
      email,
      password,
    });
    console.log(res.data); // token + user
    navigate("/login");    // go to login page after successful signup
  } catch (err) {
    setError(err.response?.data?.errors[0]?.msg || "Signup failed");
  }
  };

  const handleGoogleSignup = () => {
    console.log("Google signup clicked");
  };

  return (
    <Wrapper>
      <Container>
        {/* Left Form Section */}
        <FormSection>
          <FormWrapper>
            <h2>Sign Up</h2>
            <p>Create your account to get started</p>

            {error && <Error>{error}</Error>}

            <form onSubmit={handleSignup}>
              <InputWrapper>
                <FaUser className="icon" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </InputWrapper>

              <InputWrapper>
                <FaEnvelope className="icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </InputWrapper>

              <InputWrapper>
                <FaLock className="icon" />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </InputWrapper>

              <InputWrapper>
                <FaLock className="icon" />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </InputWrapper>

              <PrimaryButton type="submit">SIGN UP</PrimaryButton>

              <GoogleButton type="button" onClick={handleGoogleSignup}>
                <FaGoogle className="gicon" /> Sign up with Google
              </GoogleButton>

              <p className="below">
                Already have an account?{" "}
                <span className="link" onClick={() => navigate("/login")}>
                  Login
                </span>
              </p>
            </form>
          </FormWrapper>
        </FormSection>

        {/* Right Image Section */}
        <ImageSection />
      </Container>
    </Wrapper>
  );
}

export default Signup;

/* --------------------- STYLES --------------------- */
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

  .below {
    margin-top: 1rem;
    font-size: 0.85rem;
    color: #555;
  }

  .link {
    font-weight: bold;
    text-decoration: underline;
    cursor: pointer;
    color: var(--violet);
  }
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

const PrimaryButton = styled.button`
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
`;

const GoogleButton = styled.button`
  width: 100%;
  height: 50px;
  margin-top: 0.5rem;
  background: #f78da7;
  border-radius: 12px;
  color: #fff;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  border: none;

  &:hover {
    background: #ec407a;
  }
`;

const ImageSection = styled.div`
  flex: 1.2;
  background: url(${loginbg}) no-repeat center center/cover;
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
