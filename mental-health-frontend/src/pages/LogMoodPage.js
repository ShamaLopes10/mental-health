// src/pages/LogMoodPage.js
import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import MoodLogForm from '../components/Mood/MoodLogForm';
import { useAuth } from '../contexts/authContext';
import bgImg from '../assets/img/bg.jpg'; // Background image

const PageWrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  padding: 3rem 1rem;
  background: url(${bgImg}) center/cover no-repeat;
  background-size: cover;
  display: flex;
  justify-content: center;
`;

const GlassContainer = styled.div`
  width: 100%;
  max-width: 700px;
  background: rgba(255, 255, 255, 0.32);
  padding: 2.5rem 2rem;
  border-radius: 14px;
  box-shadow: 0 10px 24px rgba(16, 24, 40, 0.12);
`;

const Title = styled.h1`
  text-align: center;
  color: #6B1E77; /* same as Home */
  margin-bottom: 1rem;
  font-size: 2rem;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #555;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.6;
`;

const LogMoodPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleMoodLoggedSuccessfully = () => {
    navigate('/home'); // redirect after successful mood log
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <PageWrapper>
      <GlassContainer>
        <Title>Log Your Mood</Title>
        <Subtitle>
          Taking a moment to check in with yourself is a great step. Let's record how you're feeling right now.
        </Subtitle>
        <MoodLogForm onMoodLogged={handleMoodLoggedSuccessfully} />
      </GlassContainer>
    </PageWrapper>
  );
};

export default LogMoodPage;
