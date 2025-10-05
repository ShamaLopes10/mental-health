// src/components/Home.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/authContext'; 
import { getPersonalizedRecommendations, getMoodLogs } from '../utils/api'; 
import ContentCard from './Content/ContentCard';
import bgImg from '../assets/img/bg.jpg';
import styled from 'styled-components';

/* Styled Components */
const Wrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  background: url(${bgImg}) center/cover no-repeat;
  background-size: cover;
  padding-bottom: 3rem;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
`;

const Section = styled.section`
  margin: 2rem auto;
  background: rgba(255,255,255,0.32);
  padding: 2rem;
  border-radius: 14px;
  box-shadow: 0 10px 24px rgba(16,24,40,0.12);
  max-width: 1200px;
`;

const SectionTitle = styled.h2`
  font-size: 1.9rem;
  color: #6B1E77;
  margin: 0 0 1.8rem 0;
  display: inline-block;
  border-bottom: 2px solid #71C0BB;
  padding-bottom: 0.75rem;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
`;

const ActivityCard = styled.div`
  background: rgba(255,255,255,0.32); /* Same bg always */
  border-radius: 14px;
  padding: 2rem 1rem;
  text-align: center;
  box-shadow: 0 10px 24px rgba(16,24,40,0.12);
  border: 1px solid rgba(255,255,255,0.18);
  cursor: pointer;
  overflow: hidden;
  position: relative;
  transition: all 0.35s cubic-bezier(.2,.8,.2,1);
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  h3 {
    transition: opacity 0.3s ease, transform 0.3s ease;
  }

  .emoji {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    transition: transform 0.35s ease;
    z-index: 2;
    position: relative;
  }

  p {
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.35s ease;
    font-size: 0.95rem;
    color: #333;
    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;
    padding: 0 12px;
  }

  &:hover {
    /* Background stays the same */
    min-height: 200px;
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 18px 36px rgba(0,0,0,0.18);

    /* Hide only heading */
    h3 {
      opacity: 0;
      transform: translateY(-10px);
    }

    /* Keep emoji visible */
    .emoji {
      transform: translateY(-10px);
    }

    /* Show description */
    p {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const WelcomeMessage = styled.div`
  background: rgba(255,255,255,0.32);
  color: #6B1E77;
  padding: 2.5rem 2rem;
  text-align: center;
  margin-bottom: 2rem;
  border-radius: 14px;
  box-shadow: 0 10px 24px rgba(16,24,40,0.12);

  h1 {
    margin: 0 0 0.75rem 0;
    font-size: 2.4rem;
    font-weight: 600;
  }

  p {
    margin: 0;
    font-size: 1.15rem;
    line-height: 1.6;
    color: #333;
  }
`;

const CTAButton = styled(Link)`
  display: inline-block;
  padding: 0.9rem 1.8rem;
  background: rgb(199, 121, 190);
  color: white;
  text-decoration: none;
  border-radius: 25px;
  font-weight: bold;
  font-size: 1.05rem;
  margin: 1rem 0 2rem;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: rgba(139, 75, 131, 1);
    transform: translateY(-2px);
  }
`;

const MoodLogItem = styled.li`
  background: rgba(255,255,255,0.85);
  border-left: 5px solid #71C0BB;
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  border-radius: 0 8px 8px 0;

  p {
    margin: 0.4rem 0;
    color: #333;
    font-size: 0.95rem;
  }

  strong { color: #6B1E77; }
  .symptoms-list { font-style: italic; color: #2f8f86; }
  .log-date { font-size: 0.85rem; color: #757575; margin-bottom: 0.5rem; display: block; }
`;

const Home = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);
  const [recommendationReason, setRecommendationReason] = useState('');
  const [recentMoodLogs, setRecentMoodLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  const fetchPersonalizedData = async () => {
    if (!token) { 
      setIsLoadingRecs(false); 
      setIsLoadingLogs(false); 
      return; 
    }
    setIsLoadingRecs(true); 
    setIsLoadingLogs(true);
    try {
      const [recsData, logsData] = await Promise.all([
        getPersonalizedRecommendations(),
        getMoodLogs()
      ]);
      setRecommendations(recsData.recommendations || []);
      setRecommendationReason(recsData.reason || '');
      setRecentMoodLogs(logsData.slice(0, 3) || []);
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsLoadingRecs(false); 
      setIsLoadingLogs(false); 
    }
  };

  useEffect(() => { fetchPersonalizedData(); }, [token]);

  const activityCards = [
    { title: "Meditation", description: "Calm your mind with a 10-minute session.", emoji: "🧘‍♀️", path: "/resources" },
    { title: "Journaling", description: "Reflect on your thoughts and track your mood.", emoji: "📓", path: "/tasks" },
    { title: "Go Outside", description: "Connect with nature to reduce stress.", emoji: "🌳", path: "/resources" },
    { title: "Connect", description: "Reach out to a friend or a support group.", emoji: "💬", path: "/support-chat" },
    { title: "Mindful Reading", description: "Engage with a book or insightful articles.", emoji: "📚", path: "/videoarticles" },
    { title: "Hydrate", description: "Drink water to boost energy and focus.", emoji: "💧" },
  ];

  return (
    <Wrapper>
      <WelcomeMessage>
        <h1>Hello, {user?.username || 'there'}!</h1>
        <p>Welcome to MindSpace. Let's focus on your well-being today.</p>
      </WelcomeMessage>

      <Section>
        <SectionTitle>Quick Well-being Ideas</SectionTitle>
        <CardGrid>
          {activityCards.map((card, idx) => (
            <ActivityCard key={idx} onClick={() => card.path && navigate(card.path)}>
              <div className="emoji">{card.emoji}</div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </ActivityCard>
          ))}
        </CardGrid>
      </Section>

      <Section style={{ textAlign: 'center' }}>
        <CTAButton to="/log-mood">Log Today's Mood</CTAButton>
      </Section>

      <Section>
        <SectionTitle>Recent Mood Check-ins</SectionTitle>
        {isLoadingLogs ? (
          <p style={{textAlign:'center'}}>Loading recent entries...</p>
        ) : recentMoodLogs.length > 0 ? (
          <ul style={{listStyle:'none', padding:0}}>
            {recentMoodLogs.map(log => (
              <MoodLogItem key={log.id}>
                <span className="log-date">{new Date(log.loggedAt || log.createdAt).toLocaleString()}</span>
                <p><strong>Mood:</strong> {log.moodRating}/5</p>
                {log.symptoms?.length > 0 && <p><strong>Felt:</strong> <span className="symptoms-list">{log.symptoms.join(', ')}</span></p>}
                {log.notes && <p><strong>Notes:</strong> {log.notes}</p>}
              </MoodLogItem>
            ))}
          </ul>
        ) : (
          <p style={{textAlign:'center'}}>
            You haven't logged your mood recently. <Link to="/log-mood">Log it now!</Link>
          </p>
        )}
      </Section>

      <Section>
        <SectionTitle>For You ✨</SectionTitle>
        {recommendationReason && <p style={{textAlign:'center', fontStyle:'italic', marginBottom:'1.5rem', color:'#666'}}>{recommendationReason}</p>}
        {isLoadingRecs ? (
          <p style={{textAlign:'center'}}>Loading personalized suggestions...</p>
        ) : recommendations.length > 0 ? (
          <CardGrid>
            {recommendations.map(item => <ContentCard key={item.id} item={item} />)}
          </CardGrid>
        ) : (
          <p style={{textAlign:'center'}}>
            No specific recommendations right now. Try logging your mood or <Link to="/profile">updating your preferences</Link>!
          </p>
        )}
      </Section>
    </Wrapper>
  );
};

export default Home;
