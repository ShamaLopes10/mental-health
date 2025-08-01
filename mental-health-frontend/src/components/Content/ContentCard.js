// src/components/Content/ContentCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const CardWrapper = styled(Link)`
  display: block; /* Makes the whole card clickable */
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  text-decoration: none;
  color: inherit; /* Inherit text color from parent */
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  overflow: hidden; /* To contain absolutely positioned elements if any */

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  }
`;

const CardTitle = styled.h3`
  font-size: 1.3rem;
  color: #146c94; /* Accent color */
  margin-top: 0;
  margin-bottom: 0.5rem;
`;

const CardMeta = styled.p`
  font-size: 0.85rem;
  color: #757575; /* Grey for meta info */
  margin-bottom: 0.75rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 0.8rem; /* row-gap column-gap */

  span {
    display: inline-flex; /* For icon alignment */
    align-items: center;
  }
`;

const CardTag = styled.span`
  background-color: #e0f7fa; /* Light primary tint */
  color: #00796b; /* Darker teal */
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  margin-right: 0.4rem;
  margin-bottom: 0.4rem; /* For wrapping */
  display: inline-block;
`;

const CardBodySnippet = styled.p`
    font-size: 0.9rem;
    color: #555;
    line-height: 1.5;
    margin-top: 0.5rem;
    // For truncating text with ellipsis (optional)
    display: -webkit-box;
    -webkit-line-clamp: 3; // Show 3 lines
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
`;


const ContentCard = ({ item }) => {
  if (!item) return null;

  const getIconForType = (type) => {
    if (type === 'article') return '📄'; // Article icon
    if (type === 'video') return '▶️';   // Video icon
    if (type === 'exercise') return '🤸'; // Exercise icon
    return '💡'; // Default
  };

  return (
    <CardWrapper to={`/content/${item.id}`}>
      <CardTitle>{getIconForType(item.contentType)} {item.title}</CardTitle>
      <CardMeta>
        <span><strong>Type:</strong> {item.contentType.charAt(0).toUpperCase() + item.contentType.slice(1)}</span>
        {item.estimatedTimeMinutes && <span><strong>Time:</strong> {item.estimatedTimeMinutes} min</span>}
        {item.difficulty && <span><strong>Difficulty:</strong> {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}</span>}
      </CardMeta>
      {item.body && (item.contentType === 'article' || item.contentType === 'exercise') && (
        <CardBodySnippet>{item.body}</CardBodySnippet>
      )}
       {item.contentType === 'video' && item.url && (
        <CardBodySnippet>Watch this video resource.</CardBodySnippet>
      )}
      {item.tags && item.tags.length > 0 && (
        <div style={{ marginTop: '0.75rem' }}>
          {item.tags.slice(0, 5).map(tag => <CardTag key={tag}>{tag}</CardTag>)} {/* Show first 5 tags */}
        </div>
      )}
    </CardWrapper>
  );
};

export default ContentCard;