// src/pages/ContentListPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { getAllContent, setAuthToken } from '../utils/api';
import ContentCard from '../components/Content/ContentCard';
import styled from 'styled-components';
import { useAuth } from '../contexts/authContext';
import bgImg from '../assets/img/bg.jpg'; // Background image

const PageWrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 2rem 1rem;
  background: url(${bgImg}) center/cover no-repeat;
  background-size: cover;
`;

const GlassContainer = styled.div`
  background: rgba(255,255,255,0.32);
  border-radius: 14px;
  padding: 1.5rem;
  box-shadow: 0 10px 24px rgba(16,24,40,0.12);
`;

const Title = styled.h1`
  text-align: center;
  color: #6B1E77;
  margin-bottom: 2.5rem;
  font-size: 2.2rem;
`;

const FiltersContainer = styled(GlassContainer)`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2.5rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-width: 200px;

  label {
    font-size: 0.95rem;
    color: #333;
    margin-bottom: 0.4rem;
    font-weight: 600;
  }

  input, select {
    padding: 0.65rem 0.9rem;
    border: 1px solid rgba(0,0,0,0.08);
    border-radius: 10px;
    font-size: 0.95rem;
    background: white;
    &:focus {
      outline: none;
      border-color: rgb(199, 121, 190);
      box-shadow: 0 0 0 2px rgba(113,192,187,0.25);
    }
  }
`;

const Button = styled.button`
  padding: 0.65rem 1rem;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  background-color: ${props => props.color || 'rgb(199, 121, 190)'};
  color: white;
  transition: transform 0.2s ease, background-color 0.2s ease;
  &:hover { transform: translateY(-2px); background-color: ${props => props.hoverColor || 'rgba(139, 75, 131, 1)'}; }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const MessageText = styled.p`
  text-align: center;
  color: ${props => props.color || '#757575'};
  padding: 2rem;
  font-style: ${props => props.italic ? 'italic' : 'normal'};
`;

const CONTENT_TYPE_FILTER_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'article', label: 'Articles' },
  { value: 'video', label: 'Videos' },
  { value: 'exercise', label: 'Exercises' },
];

const ContentListPage = () => {
  const { isAuthenticated, loading: authLoading, token } = useAuth();
  const [contentItems, setContentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedTags, setSelectedTags] = useState('');
  const [tempSearchTerm, setTempSearchTerm] = useState('');

  const fetchContent = useCallback(async () => {
    if (!token) {
      setError("Authorization token missing. Please login again.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (searchTerm.trim()) filters.search = searchTerm.trim();
      if (selectedType) filters.type = selectedType;
      if (selectedTags.trim()) filters.tags = selectedTags.trim().split(',').map(t => t.trim());
      const items = await getAllContent(filters);
      setContentItems(items);
    } catch (err) {
      console.error("ContentList fetch error:", err.response ? err.response.data : err);
      setError(err.response?.data?.msg || "Failed to load resources. Please try again.");
      setContentItems([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedType, selectedTags, token]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && token) {
      setAuthToken(token);
      fetchContent();
    } else if (!authLoading && !isAuthenticated) {
      setError("You must be logged in to see resources.");
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, token, fetchContent]);

  const handleSearchSubmit = (e) => { e.preventDefault(); setSearchTerm(tempSearchTerm); };
  const handleClearFilters = () => { setTempSearchTerm(''); setSearchTerm(''); setSelectedType(''); setSelectedTags(''); };

  if (authLoading) return <MessageText>Checking authentication...</MessageText>;

  return (
    <PageWrapper>
      <Title>Explore Wellness Resources</Title>

      <FiltersContainer>
        <FilterGroup as="form" onSubmit={handleSearchSubmit} style={{flexBasis: '100%', marginBottom: '1rem'}}>
          <label htmlFor="search-resources">Search by Keyword</label>
          <div style={{display:'flex', gap:'0.5rem'}}>
            <input id="search-resources" type="text" placeholder="e.g., mindfulness, stress, breathing" value={tempSearchTerm} onChange={e => setTempSearchTerm(e.target.value)} />
            <Button type="submit">Search</Button>
          </div>
        </FilterGroup>

        <FilterGroup>
          <label htmlFor="type-filter">Filter by Type</label>
          <select id="type-filter" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
            {CONTENT_TYPE_FILTER_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </FilterGroup>

        <FilterGroup>
          <label htmlFor="tags-filter">Filter by Tags (comma-separated)</label>
          <input id="tags-filter" type="text" placeholder="e.g., anxiety, sleep" value={selectedTags} onChange={e => setSelectedTags(e.target.value)} />
        </FilterGroup>

        <FilterGroup style={{justifyContent: 'flex-end', alignItems: 'flex-end'}}>
          <Button color="#757575" hoverColor="#555" onClick={handleClearFilters}>Clear Filters</Button>
        </FilterGroup>
      </FiltersContainer>

      {loading && <MessageText>Loading resources...</MessageText>}
      {error && <MessageText color="red">{error}</MessageText>}

      {!loading && !error && (
        contentItems.length === 0 ? (
          <MessageText>
            No resources found matching your criteria. Try adjusting filters or{' '}
            <Button color="transparent" hoverColor="rgba(25,167,206,0.1)" onClick={handleClearFilters} style={{color:'rgb(199, 121, 190)', textDecoration:'underline', padding:0}}>clear all filters</Button>.
          </MessageText>
        ) : (
          <ContentGrid>
            {contentItems.map(item => <ContentCard key={item.id} item={item} />)}
          </ContentGrid>
        )
      )}
    </PageWrapper>
  );
};

export default ContentListPage;
