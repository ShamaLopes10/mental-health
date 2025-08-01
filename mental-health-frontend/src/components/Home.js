// src/components/Home.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Added Link
import styled from 'styled-components';
import { useAuth } from '../contexts/authContext'; // VERIFY PATH
import { getPersonalizedRecommendations, getMoodLogs } from '../utils/api'; // VERIFY PATH
import ContentCard from './Content/ContentCard'; // VERIFY PATH (assuming ContentCard.js is in src/components/Content/)

// Styled components for this Home page
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 70px); /* Adjust 70px based on your actual global Navbar height */
  background-color: #f6f1f1; /* Light background for the page */
  padding-bottom: 3rem; /* Space at the bottom */
`;

const WelcomeMessage = styled.div`
  background-color: #e0f7fa; /* Lighter, calming blue */
  color: #00796b; /* Darker teal for text */
  padding: 2.5rem 2rem;
  text-align: center;
  margin-bottom: 2rem;
  border-bottom: 3px solid #b2dfdb; /* Softer border */

  h1 {
    margin: 0 0 0.75rem 0;
    font-size: 2.4rem;
    font-weight: 600;
  }
  p {
    margin: 0;
    font-size: 1.15rem;
    color: #004d40; /* Darker green/blue */
    line-height: 1.6;
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 0 1.5rem; /* Horizontal padding for content sections */
  max-width: 1200px; /* Max width for content for larger screens */
  margin: 0 auto; /* Center content */
  width: 100%;
`;

const Section = styled.section`
  margin-bottom: 3rem;
  background-color: #ffffff; /* White background for sections */
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.07);
`;

const SectionTitle = styled.h2`
  font-size: 1.9rem;
  color: #146c94; /* Your accent color */
  margin-top: 0;
  margin-bottom: 1.8rem;
  text-align: left; /* Align to left for a cleaner look within sections */
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #19a7ce; /* Primary color for underline */
  display: inline-block; /* To make border only as wide as text */
`;

const CardGrid = styled.div` /* Renamed from CardContainer for clarity */
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); /* Responsive grid */
  gap: 1.8rem;
`;

// Using ContentCard for recommendations. For static cards, we can define a similar one or reuse.
// Let's assume static cards will also use a similar structure or a slightly different styled component.
const ActivityCard = styled.div`
  background: #e3f2fd; /* Light blue for activity cards */
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0,0,0,0.06);
  border: 1px solid #bbdefb;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: ${props => props.hasLink ? 'pointer' : 'default'};

  h3 {
    margin: 0.75rem 0 0.5rem;
    font-size: 1.3rem;
    color: #0d47a1; /* Darker blue */
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 15px rgba(0,0,0,0.1);
  }
`;

const Emoji = styled.div`
  font-size: 3rem;
  margin-bottom: 0.5rem;
`;

const StaticDescription = styled.p`
  font-size: 0.9rem;
  color: #424242; /* Darker grey */
  line-height: 1.5;
  margin-top: 0.5rem;
  min-height: 50px; /* Ensure some consistent height */
`;

const CallToActionButton = styled(Link)`
  display: inline-block;
  padding: 0.9rem 1.8rem;
  background-color: #19a7ce;
  color: white;
  text-decoration: none;
  border-radius: 25px; /* Pill shape */
  font-weight: bold;
  text-align: center;
  margin: 1rem 0 2rem;
  transition: background-color 0.3s ease, transform 0.2s ease;
  font-size: 1.05rem;

  &:hover {
    background-color: #146c94;
    transform: translateY(-2px);
  }
`;

const RecentMoodsContainer = styled.div`
  margin-top: 1rem;
  ul { list-style: none; padding: 0; }
`;
const MoodLogDisplayItem = styled.li`
  background-color: #fafafa;
  border-left: 5px solid #b2dfdb; /* Accent border */
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
  border-radius: 0 8px 8px 0; /* Rounded corners on one side */
  p { margin: 0.4rem 0; color: #555; font-size: 0.95rem; }
  strong { color: #333; }
  .symptoms-list { font-style: italic; color: #00796b; }
  .log-date { font-size: 0.85rem; color: #757575; margin-bottom: 0.5rem; display: block;}
`;
const LoadingText = styled.p`text-align: center; color: #777; font-style: italic; padding: 1rem;`;
const NoDataText = styled.p`text-align: center; color: #757575; padding: 1rem;`;


const Home = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true); // Start true
  const [recommendationReason, setRecommendationReason] = useState('');

  const [recentMoodLogs, setRecentMoodLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true); // Start true

  const fetchPersonalizedData = useCallback(async () => {
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
      console.error("Home page data fetch error:", error);
      // Set specific error states if needed
    } finally {
      setIsLoadingRecs(false);
      setIsLoadingLogs(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPersonalizedData();
  }, [fetchPersonalizedData]); // fetchPersonalizedData depends on token

  // Static cards, ensure paths are correct
  const activityCards = [
    { title: "Meditation", description: "Calm your mind with a 10-minute session.", emoji: "🧘‍♀️", path: "/resources" },
    { title: "Journaling", description: "Reflect on your thoughts and track your mood.", emoji: "📓", path: "/tasks" }, // Or link to a future dedicated journal page
    { title: "Go Outside", description: "Connect with nature to reduce stress.", emoji: "🌳", path: "/resources" },
    { title: "Connect", description: "Reach out to a friend or a support group.", emoji: "💬", path: "/support-chat" },
    { title: "Mindful Reading", description: "Engage with a book or insightful articles.", emoji: "📚", path: "/videoarticles" }, // Assuming videoarticles also has articles
    { title: "Hydrate", description: "Drink water to boost energy and focus.", emoji: "💧"},
  ];

  return (
    <Wrapper>
      <WelcomeMessage>
        <h1>Hello, {user?.username || 'there'}!</h1>
        <p>Welcome to MindScribe. Let's focus on your well-being today.</p>
      </WelcomeMessage>

       <Section>
          <SectionTitle>Quick Well-being Ideas</SectionTitle>
          <CardGrid>
            {activityCards.map((card, index) => (
              <ActivityCard key={`activity-${index}`} onClick={() => card.path && navigate(card.path)} hasLink={!!card.path}>
                <Emoji>{card.emoji}</Emoji>
                <h3>{card.title}</h3>
                <StaticDescription>{card.description}</StaticDescription>
              </ActivityCard>
            ))}
          </CardGrid>
        </Section>

      <MainContent>
        <Section style={{ textAlign: 'center' }}>
          <CallToActionButton to="/log-mood">Log Today's Mood</CallToActionButton>
        </Section>

        

        

        <Section>
          <SectionTitle>Recent Mood Check-ins</SectionTitle>
          {isLoadingLogs ? (
            <LoadingText>Loading recent entries...</LoadingText>
          ) : recentMoodLogs.length > 0 ? (
            <RecentMoodsContainer>
              <ul>
                {recentMoodLogs.map(log => (
                  <MoodLogDisplayItem key={log.id}>
                    <span className="log-date">{new Date(log.loggedAt || log.createdAt).toLocaleString()}</span>
                    <p><strong>Mood:</strong> {log.moodRating}/5</p>
                    {log.symptoms && log.symptoms.length > 0 && (
                      <p><strong>Felt:</strong> <span className="symptoms-list">{log.symptoms.join(', ')}</span></p>
                    )}
                    {log.notes && <p><strong>Notes:</strong> {log.notes}</p>}
                  </MoodLogDisplayItem>
                ))}
              </ul>
              {recentMoodLogs.length >=3 && <div style={{textAlign: 'center', marginTop: '1rem'}}><Link to="/mood-history">View all entries</Link></div> } {/* Link to future mood history page */}
            </RecentMoodsContainer>
          ) : (
            <NoDataText>You haven't logged your mood recently. <Link to="/log-mood">Log it now!</Link></NoDataText>
          )}
        </Section>

        <Section>
          <SectionTitle>For You ✨</SectionTitle>
          {recommendationReason && <p style={{textAlign: 'center', fontStyle: 'italic', marginBottom: '1.5rem', color: '#666'}}>{recommendationReason}</p>}
          {isLoadingRecs ? (
            <LoadingText>Loading personalized suggestions...</LoadingText>
          ) : recommendations.length > 0 ? (
            <CardGrid>
              {recommendations.map(item => (
                <ContentCard key={`rec-${item.id}`} item={item} />
              ))}
            </CardGrid>
          ) : (
            <NoDataText>
              No specific recommendations right now. Try logging your mood or <Link to="/profile">updating your preferences</Link>!
              You can also <Link to="/resources">explore all resources</Link>.
            </NoDataText>
          )}
        </Section>
        
      </MainContent>
    </Wrapper>
  );
};

export default Home;