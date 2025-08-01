// src/pages/LogMoodPage.js
import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import MoodLogForm from '../components/Mood/MoodLogForm'; // Adjust path if needed
import { useAuth } from '../contexts/authContext'; // Adjust path if needed

const PageContainer = styled.div`
  max-width: 700px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #fff; /* Or your page background color */
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
`;

const Title = styled.h1`
  text-align: center;
  color: #146c94; /* Your accent color */
  margin-bottom: 1rem;
  font-size: 2rem;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #555;
  margin-bottom: 2.5rem;
  font-size: 1.1rem;
  line-height: 1.6;
`;

const LogMoodPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // To ensure user is logged in, though ProtectedRoute handles access

  const handleMoodLoggedSuccessfully = () => {
    // console.log("Mood logged successfully from LogMoodPage!");
    // After successful logging, you might want to navigate the user somewhere,
    // e.g., back to the dashboard/home, or show a success message and stay.
    // For now, let's navigate to the home page.
    navigate('/home'); // Or '/dashboard' if that's your main page
  };

  if (!user) {
    // This is an extra check; ProtectedRoute in App.js should prevent unauthorized access.
    // However, if for some reason it's reached and user is null, redirect.
    navigate('/login');
    return null; // Or a loading spinner while redirecting
  }

  return (
    <PageContainer>
      <Title>Log Your Mood</Title>
      <Subtitle>
        Taking a moment to check in with yourself is a great step.
        Let's record how you're feeling right now.
      </Subtitle>
      <MoodLogForm onMoodLogged={handleMoodLoggedSuccessfully} />
    </PageContainer>
  );
};

export default LogMoodPage;