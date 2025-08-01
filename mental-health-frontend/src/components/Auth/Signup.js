// src/components/Auth/Signup.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSignup = (e) => {
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

    // Simulate success
    console.log("Signed up:", formData);
    navigate("/home");
  };

  return (
    <Container>
      <Form onSubmit={handleSignup}>
        <h1>Sign Up</h1>
        {error && <Error>{error}</Error>}
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Create Password"
          value={formData.password}
          onChange={handleChange}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
        <button type="submit">Sign Up</button>
        <p>
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </Form>
    </Container>
  );
};

export default Signup;

// Styled Components
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f6f1f1; /* var(--color-bg) */
`;

const Form = styled.form`
  background-color: #afd3e2; /* var(--color-surface) */
  padding: 2rem 3rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  width: 350px;
  color: #333333; /* var(--color-text) */

  h1 {
    margin-bottom: 1rem;
    text-align: center;
    color: #146c94; /* var(--color-accent) */
  }

  input {
    padding: 0.75rem;
    margin-bottom: 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 1rem;
  }

  button {
    padding: 0.75rem;
    background-color: #19a7ce; /* var(--color-primary) */
    border: none;
    color: #ffffff; /* var(--color-light-text) */
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: #146c94; /* var(--color-accent) */
    }
  }

  p {
    margin-top: 1rem;
    text-align: center;
    font-size: 0.9rem;

    span {
      color: #19a7ce; /* var(--color-primary) */
      cursor: pointer;

      &:hover {
        color: #146c94; /* var(--color-accent) */
      }
    }
  }
`;

const Error = styled.div`
  background-color: #ffe5e5;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border-left: 5px solid #f44336;
  font-size: 0.9rem;
  color: #b71c1c;
`;

// src/components/Auth/Signup.js
// import React, { useState } from 'react';
// import { useAuth } from '../../contexts/authContext'; // Adjust path if needed
// import { useNavigate } from 'react-router-dom'; // For redirection

// function Signup() {
//     const [formData, setFormData] = useState({
//         username: '',
//         email: '',
//         password: '',
//         confirmPassword: ''
//     });
//     const [error, setError] = useState('');
//     const { signup } = useAuth();
//     const navigate = useNavigate();

//     const { username, email, password, confirmPassword } = formData;

//     const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

//     const onSubmit = async e => {
//         e.preventDefault();
//         setError('');
//         if (password !== confirmPassword) {
//             setError('Passwords do not match');
//             return;
//         }
//         try {
//             await signup(username, email, password);
//             navigate('/home'); // Or your dashboard route
//         } catch (err) {
//             // Assuming error response from backend is { errors: [{msg: ...}] } or just a message
//             const errorMsg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.msg || 'Registration failed. Please try again.';
//             setError(errorMsg);
//             console.error(err);
//         }
//     };

//     return (
//         <div>
//             <h2>Sign Up</h2>
//             {error && <p style={{ color: 'red' }}>{error}</p>}
//             <form onSubmit={onSubmit}>
//                 <div>
//                     <input type="text" placeholder="Username" name="username" value={username} onChange={onChange} required />
//                 </div>
//                 <div>
//                     <input type="email" placeholder="Email Address" name="email" value={email} onChange={onChange} required />
//                 </div>
//                 <div>
//                     <input type="password" placeholder="Password" name="password" value={password} onChange={onChange} minLength="6" required />
//                 </div>
//                 <div>
//                     <input type="password" placeholder="Confirm Password" name="confirmPassword" value={confirmPassword} onChange={onChange} minLength="6" required />
//                 </div>
//                 <input type="submit" value="Register" />
//             </form>
//         </div>
//     );
// }

// export default Signup;