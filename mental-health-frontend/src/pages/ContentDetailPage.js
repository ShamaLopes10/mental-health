// src/pages/ContentDetailPage.js
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useParams, Link as RouterLink } from 'react-router-dom';
import { getContentItemById, logContentInteraction, getUserInteractionForItem } from '../utils/api'; // Ensure all are imported
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- Styled Components (Keep these as they are from your existing code) ---
const PageContainer = styled.div` /* ... */ `;
const Title = styled.h1` /* ... */ `;
const MetaInfo = styled.p` /* ... */ `;
const Tag = styled.span` /* ... */ `;
const ContentBody = styled.div` /* ... */ `;
const VideoEmbed = styled.div` /* ... */ `;
const FeedbackSection = styled.div` /* ... */ `;
const FeedbackTitle = styled.h3` /* ... */ `;
const RatingContainer = styled.div` /* ... */ `;
const HelpfulButtons = styled.div` /* ... */ `;
// --- End Styled Components ---

const ContentDetailPage = () => {
  const { id: contentItemId } = useParams(); // Using contentItemId for clarity
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for user interaction
  const [userRating, setUserRating] = useState(0); // 0 for no rating, or null
  const [isHelpful, setIsHelpful] = useState(null); // null, true, or false
  const [feedbackMessage, setFeedbackMessage] = useState(''); // For "Thanks for your feedback!"

  // useCallback for fetch function to stabilize its reference for useEffect
  const fetchData = useCallback(async () => {
    if (!contentItemId) return;
    setLoading(true);
    setError(null);
    setFeedbackMessage(''); // Clear previous feedback messages

    try {
      // Fetch content item and existing user interaction concurrently
      const [fetchedItemData, interactionData] = await Promise.all([
        getContentItemById(contentItemId),
        getUserInteractionForItem(contentItemId)
      ]);

      setItem(fetchedItemData);

      if (interactionData) {
        setUserRating(interactionData.rating || 0); // Default to 0 if null
        setIsHelpful(interactionData.isHelpful);   // This will be null, true, or false
      } else {
        // No prior interaction, reset local state
        setUserRating(0);
        setIsHelpful(null);
      }

      // Log a "view" if no prior interaction recorded for this session or based on your logic
      // This is a simple way; more advanced view tracking might consider session views
      if (!interactionData || !interactionData.viewedAt) { // Only log view if no interaction exists yet
        // console.log(`[ContentDetailPage] Logging initial view for item: ${contentItemId}`);
        await logContentInteraction(contentItemId, { viewed: true }); // Send viewed=true
      }

    } catch (err) {
      setError("Failed to load this resource or your interaction data. Please try again.");
      console.error("ContentDetail fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [contentItemId]); // contentItemId is the dependency

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Run fetchData when it (or its dependencies like contentItemId) changes

  const handleRating = async (newRating) => {
    const currentRating = userRating; // Store current rating in case of error
    setUserRating(newRating); // Optimistic UI update
    setFeedbackMessage(''); // Clear previous messages
    try {
      await logContentInteraction(contentItemId, { rating: newRating });
      setFeedbackMessage('Thanks for your rating!');
      setTimeout(() => setFeedbackMessage(''), 3000); // Clear message after 3s
    } catch (err) {
      console.error("Error submitting rating:", err);
      setError("Could not submit your rating. Please try again.");
      setUserRating(currentRating); // Revert optimistic update on error
    }
  };

  const handleHelpful = async (wasHelpful) => {
    const currentIsHelpful = isHelpful; // Store current state
    // Toggle behavior: if clicking the same button, set to null (un-select)
    const newIsHelpful = isHelpful === wasHelpful ? null : wasHelpful;
    setIsHelpful(newIsHelpful); // Optimistic UI update
    setFeedbackMessage('');
    try {
      await logContentInteraction(contentItemId, { isHelpful: newIsHelpful });
      setFeedbackMessage('Feedback saved!');
      setTimeout(() => setFeedbackMessage(''), 3000);
    } catch (err) {
      console.error("Error submitting helpfulness:", err);
      setError("Could not save your feedback. Please try again.");
      setIsHelpful(currentIsHelpful); // Revert optimistic update
    }
  };

  const renderContent = () => {
    if (!item) return <p>Loading content details...</p>; // Should be caught by main loading state

    if (item.contentType === 'video' && item.url) {
      let videoId = '';
      try {
        const urlObj = new URL(item.url);
        if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
          videoId = urlObj.searchParams.get('v');
        } else if (urlObj.hostname === 'youtu.be') {
          videoId = urlObj.pathname.substring(1);
        }
      } catch (e) { console.error("Invalid video URL", item.url); }

      return videoId ? (
        <VideoEmbed>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </VideoEmbed>
      ) : (
        <p><a href={item.url} target="_blank" rel="noopener noreferrer">Watch Video at original source</a></p>
      );
    }
    if (item.body && (item.contentType === 'article' || item.contentType === 'exercise')) {
      return <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.body}</ReactMarkdown>;
    }
    return <p>No displayable content available for this type.</p>;
  };

  if (loading) return <PageContainer><p>Loading content details and your interactions...</p></PageContainer>;
  if (error) return <PageContainer><p style={{color: 'red'}}>{error} <RouterLink to="/resources">Go back to resources</RouterLink></p></PageContainer>;
  if (!item) return <PageContainer><p>Resource not found. <RouterLink to="/resources">Explore other resources</RouterLink></p></PageContainer>;

  return (
    <PageContainer>
      <Title>{item.title}</Title>
      <MetaInfo>
        Type: {item.contentType.charAt(0).toUpperCase() + item.contentType.slice(1)}
        {item.estimatedTimeMinutes && ` | Approx. ${item.estimatedTimeMinutes} min read/watch`}
        {item.difficulty && ` | Difficulty: ${item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}`}
      </MetaInfo>
      {item.tags && item.tags.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          {item.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
        </div>
      )}
      {item.source && <p style={{fontSize: '0.8rem', color: '#888', fontStyle: 'italic'}}>Source: {item.source}</p>}
      <hr style={{border: 0, borderTop: '1px solid #eee', margin: '1.5rem 0'}}/>

      <ContentBody>
        {renderContent()}
      </ContentBody>

      <FeedbackSection>
        <FeedbackTitle>Your Feedback</FeedbackTitle>
        {feedbackMessage && <p style={{color: 'green', fontStyle: 'italic', marginBottom: '1rem'}}>{feedbackMessage}</p>}
        {/* Display component-level error specific to feedback if needed */}
        {/* {feedbackError && <p style={{color: 'red'}}>{feedbackError}</p>} */}

        <RatingContainer>
          <span>Rate this resource:</span>
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              className={star <= userRating ? 'selected' : ''}
              onClick={() => handleRating(star)}
              aria-label={`Rate ${star} out of 5 stars`}
              title={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              ★
            </button>
          ))}
        </RatingContainer>

        <HelpfulButtons>
          <span>Was this helpful?</span>
          <button
            onClick={() => handleHelpful(true)}
            className={isHelpful === true ? 'selected-yes' : ''}
          >
            👍 Yes
          </button>
          <button
            onClick={() => handleHelpful(false)}
            className={isHelpful === false ? 'selected-no' : ''}
          >
            👎 No
          </button>
        </HelpfulButtons>
        {/* TODO: Add a textarea for feedbackText and a submit button for it */}
      </FeedbackSection>

      <div style={{marginTop: '2rem', textAlign: 'center'}}>
        <RouterLink to="/resources" style={{color: '#19a7ce', textDecoration: 'none', fontWeight: 'bold'}}>
          ← Back to All Resources
        </RouterLink>
      </div>
    </PageContainer>
  );
};

export default ContentDetailPage;