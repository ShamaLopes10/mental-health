// import React from "react";

// const VideoArticles = () => {
//   return <div>Videos & Articles Page Coming Soon...</div>;
// };

// export default VideoArticles;

import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const resources = [
  {
    type: "video",
    title: "5 Minute Meditation for Anxiety",
    link: "https://www.youtube.com/watch?v=inpok4MKVLM",
    thumbnail: "https://img.youtube.com/vi/inpok4MKVLM/hqdefault.jpg",
  },
  {
    type: "article",
    title: "10 Science-Backed Benefits of Journaling",
    link: "https://positivepsychology.com/benefits-of-journaling/",
    thumbnail: "https://images.unsplash.com/photo-1584697964403-f042c9fdd32e?auto=format&fit=crop&w=800&q=80",
  },
  {
    type: "video",
    title: "Stretching to Start Your Day",
    link: "https://www.youtube.com/watch?v=4BOTvaRaDjI",
    thumbnail: "https://img.youtube.com/vi/4BOTvaRaDjI/hqdefault.jpg",
  },
  {
    type: "article",
    title: "How Nature Heals Your Brain",
    link: "https://www.nature.com/articles/d41586-019-00677-6",
    thumbnail: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  },
];

const VideoArticles = () => {
  const navigate = useNavigate();

  return (
    <Wrapper>
      <Header>Curated Videos & Articles</Header>
      <Grid>
        {resources.map((item, index) => (
          <Card key={index} onClick={() => window.open(item.link, "_blank")}>
            <Thumb src={item.thumbnail} alt={item.title} />
            <Title>{item.title}</Title>
            <Tag>{item.type.toUpperCase()}</Tag>
          </Card>
        ))}
      </Grid>
      <BackButton onClick={() => navigate("/")}>← Back to Home</BackButton>
    </Wrapper>
  );
};

export default VideoArticles;

// Styled Components
const Wrapper = styled.div`
  background-color: #f6f1f1;
  min-height: 100vh;
  padding: 2rem;
`;

const Header = styled.h2`
  text-align: center;
  color: #146c94;
  margin-bottom: 2rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  background-color: #afd3e2;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.04);
  }
`;

const Thumb = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
`;

const Title = styled.h3`
  font-size: 1.1rem;
  padding: 0.75rem 1rem 0;
  color: #146c94;
`;

const Tag = styled.div`
  font-size: 0.8rem;
  padding: 0.25rem 1rem 1rem;
  color: #333333;
`;

const BackButton = styled.button`
  display: block;
  margin: 2rem auto 0;
  padding: 0.6rem 1.2rem;
  background-color: #19a7ce;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    background-color: #146c94;
  }
`;
