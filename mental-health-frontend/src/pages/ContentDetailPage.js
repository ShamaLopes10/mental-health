// src/pages/ContentDetailPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { getContentItemById, logContentInteraction, getUserInteractionForItem } from '../utils/api';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import bgImg from '../assets/img/bg.jpg';

// --- Styled Components ---
const PageContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  padding: 2rem 1rem;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  background: url(${bgImg}) center/cover no-repeat;
  background-size: cover;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

const Title = styled.h1`
  text-align: center;
  color: #6B1E77;
  margin-bottom: 1rem;
`;

const MetaInfo = styled.p`
  text-align: center;
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 1rem;
`;

const Tag = styled.span`
  display: inline-block;
  background: rgba(139, 75, 131, 0.2);
  color: #6B1E77;
  padding: 0.25rem 0.5rem;
  margin: 0 0.3rem 0.3rem 0;
  border-radius: 5px;
  font-size: 0.85rem;
`;

const ContentBody = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  font-size: 1rem;
  line-height: 1.6;
  background: rgba(255,255,255,0.85);
  border-radius: 12px;
  padding: 2rem;
`;

const VideoEmbed = styled.div`
  width: 100%;
  height: 80vh;
  iframe {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 12px;
  }
`;

const FeedbackSection = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: rgba(255,255,255,0.85);
  border-radius: 12px;
`;

const FeedbackTitle = styled.h3`
  margin-bottom: 1rem;
`;

const RatingContainer = styled.div`
  margin-bottom: 1rem;
  span { margin-right: 0.5rem; }
  button {
    font-size: 1.2rem;
    margin-right: 0.3rem;
    background: none;
    border: none;
    cursor: pointer;
    color: #ccc;
    &.selected { color: gold; }
  }
`;

const HelpfulButtons = styled.div`
  span { margin-right: 0.5rem; }
  button {
    margin-right: 0.5rem;
    padding: 0.35rem 0.7rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    background-color: #ddd;
    &.selected-yes { background-color: #19a7ce; color: white; }
    &.selected-no { background-color: #e74c3c; color: white; }
  }
`;
// --- End Styled Components ---

const ContentDetailPage = () => {
  const { id: contentItemId } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [isHelpful, setIsHelpful] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const fetchData = useCallback(async () => {
    if (!contentItemId) return;
    setLoading(true);
    setError(null);
    setFeedbackMessage('');

    try {
      const [fetchedItemData, interactionData] = await Promise.all([
        getContentItemById(contentItemId),
        getUserInteractionForItem(contentItemId)
      ]);

      setItem(fetchedItemData);

      if (interactionData) {
        setUserRating(interactionData.rating || 0);
        setIsHelpful(interactionData.isHelpful);
      } else {
        setUserRating(0);
        setIsHelpful(null);
      }

      if (!interactionData || !interactionData.viewedAt) {
        await logContentInteraction(contentItemId, { viewed: true });
      }

    } catch (err) {
      setError("Failed to load this resource or your interaction data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [contentItemId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRating = async (newRating) => {
    const currentRating = userRating;
    setUserRating(newRating);
    setFeedbackMessage('');
    try {
      await logContentInteraction(contentItemId, { rating: newRating });
      setFeedbackMessage('Thanks for your rating!');
      setTimeout(() => setFeedbackMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setError("Could not submit your rating. Please try again.");
      setUserRating(currentRating);
    }
  };

  const handleHelpful = async (wasHelpful) => {
    const currentIsHelpful = isHelpful;
    const newIsHelpful = isHelpful === wasHelpful ? null : wasHelpful;
    setIsHelpful(newIsHelpful);
    setFeedbackMessage('');
    try {
      await logContentInteraction(contentItemId, { isHelpful: newIsHelpful });
      setFeedbackMessage('Feedback saved!');
      setTimeout(() => setFeedbackMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setError("Could not save your feedback. Please try again.");
      setIsHelpful(currentIsHelpful);
    }
  };

  const renderContent = () => {
    if (!item) return <p>Loading content...</p>;

    if (item.contentType === 'video' && item.url) {
      let videoId = '';
      try {
        const urlObj = new URL(item.url);
        if (urlObj.hostname.includes('youtube.com')) videoId = urlObj.searchParams.get('v');
        else if (urlObj.hostname.includes('youtu.be')) videoId = urlObj.pathname.substring(1);
      } catch (e) { console.error("Invalid video URL", item.url); }

      return videoId ? (
        <VideoEmbed>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </VideoEmbed>
      ) : (
        <p><a href={item.url} target="_blank" rel="noopener noreferrer">Watch Video at original source</a></p>
      );
    }

    if (item.contentType === 'article' && item.url) {
      return (
        <p>
          Read full article here: 
          <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: '#19a7ce', textDecoration: 'underline', marginLeft: '0.3rem' }}>
            {item.title}
          </a>
        </p>
      );
    }

    if (item.contentType === 'exercise' && item.steps?.length) {
      return (
        <div>
          <h3>Steps to do this exercise:</h3>
          <ol>
            {item.steps.map((step, index) => <li key={index}>{step}</li>)}
          </ol>
        </div>
      );
    }

    // fallback to markdown if body exists
    if (item.body) return <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.body}</ReactMarkdown>;

    return <p>No displayable content available.</p>;
  };

  if (loading) return <PageContainer><p>Loading content details...</p></PageContainer>;
  if (error) return <PageContainer><p style={{color:'red'}}>{error} <RouterLink to="/resources">Go back</RouterLink></p></PageContainer>;
  if (!item) return <PageContainer><p>Resource not found. <RouterLink to="/resources">Explore resources</RouterLink></p></PageContainer>;

  return (
    <PageContainer>
      <Title>{item.title}</Title>
      <MetaInfo>
        Type: {item.contentType.charAt(0).toUpperCase() + item.contentType.slice(1)}
        {item.estimatedTimeMinutes && ` | Approx. ${item.estimatedTimeMinutes} min`}
        {item.difficulty && ` | Difficulty: ${item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}`}
      </MetaInfo>
      {item.tags && item.tags.length > 0 && <div style={{ textAlign:'center', marginBottom:'1rem' }}>{item.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}</div>}
      {item.source && <p style={{fontSize:'0.8rem', color:'#888', textAlign:'center', fontStyle:'italic'}}>Source: {item.source}</p>}

      <ContentBody>{renderContent()}</ContentBody>

      <FeedbackSection>
        <FeedbackTitle>Your Feedback</FeedbackTitle>
        {feedbackMessage && <p style={{color:'green', fontStyle:'italic'}}>{feedbackMessage}</p>}

        <RatingContainer>
          <span>Rate this resource:</span>
          {[1,2,3,4,5].map(star => (
            <button key={star} className={star <= userRating ? 'selected' : ''} onClick={() => handleRating(star)}>{'★'}</button>
          ))}
        </RatingContainer>

        <HelpfulButtons>
          <span>Was this helpful?</span>
          <button onClick={() => handleHelpful(true)} className={isHelpful === true ? 'selected-yes' : ''}>👍 Yes</button>
          <button onClick={() => handleHelpful(false)} className={isHelpful === false ? 'selected-no' : ''}>👎 No</button>
        </HelpfulButtons>
      </FeedbackSection>

      <div style={{textAlign:'center', marginTop:'2rem'}}>
        <RouterLink to="/resources" style={{color:'#19a7ce', textDecoration:'none', fontWeight:'bold'}}>← Back to All Resources</RouterLink>
      </div>
    </PageContainer>
  );
};

export default ContentDetailPage;
