// src/pages/ContentListPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { getAllContent } from '../utils/api'; // Adjust path
import ContentCard from '../components/Content/ContentCard'; // Adjust path
import styled from 'styled-components';

const PageContainer = styled.div`
  max-width: 1000px; /* Slightly wider for filters */
  margin: 2rem auto;
  padding: 1rem 1.5rem; /* Adjust padding */
`;

const Title = styled.h1`
  text-align: center;
  color: #146c94;
  margin-bottom: 2.5rem; /* More space after title */
  font-size: 2.2rem;
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap; /* Allow filters to wrap on smaller screens */
  gap: 1rem;
  margin-bottom: 2.5rem;
  padding: 1rem;
  background-color: #f9f9f9; /* Light background for filter section */
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* Allow groups to grow */
  min-width: 200px; /* Minimum width for filter groups */

  label {
    font-size: 0.9rem;
    color: #555;
    margin-bottom: 0.3rem;
    font-weight: 500;
  }

  input, select {
    padding: 0.7rem 0.9rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1rem;
    background-color: white;
    &:focus {
      outline: none;
      border-color: #19a7ce;
      box-shadow: 0 0 0 2px rgba(25, 167, 206, 0.2);
    }
  }
`;

const LoadingText = styled.p`text-align: center; color: #777; font-style: italic; padding: 2rem;`;
const ErrorText = styled.p`text-align: center; color: red; background-color: #ffebee; padding: 1rem; border-radius: 4px;`;
const NoResultsText = styled.p`text-align: center; color: #555; padding: 2rem; font-size: 1.1rem;`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.8rem; /* Increased gap */
`;

// Define available content types for the filter dropdown
const CONTENT_TYPE_FILTER_OPTIONS = [
    { value: '', label: 'All Types' },
    { value: 'article', label: 'Articles' },
    { value: 'video', label: 'Videos' },
    { value: 'exercise', label: 'Exercises' },
];

const ContentListPage = () => {
  const [contentItems, setContentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState(''); // Stores the value e.g., 'article'
  const [selectedTags, setSelectedTags] = useState(''); // Comma-separated string for input

  // Temporary state for search input to avoid fetching on every keystroke
  const [tempSearchTerm, setTempSearchTerm] = useState('');

  const fetchContent = useCallback(async () => {
    // console.log(`[ContentListPage] Fetching content with filters: Search='${searchTerm}', Type='${selectedType}', Tags='${selectedTags}'`);
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (searchTerm.trim()) filters.search = searchTerm.trim();
      if (selectedType) filters.type = selectedType;
      if (selectedTags.trim()) filters.tags = selectedTags.trim().split(',').map(t => t.trim()).join(','); // Ensure it's a clean comma-separated string for API

      const items = await getAllContent(filters);
      setContentItems(items);
    } catch (err) {
      setError("Failed to load resources. Please try refreshing the page or adjusting filters.");
      console.error("ContentList fetch error:", err);
      setContentItems([]); // Clear items on error
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedType, selectedTags]); // Dependencies for re-fetching

  useEffect(() => {
    // Fetch content when filter criteria (searchTerm, selectedType, selectedTags) change
    fetchContent();
  }, [fetchContent]); // fetchContent is memoized and its dependencies trigger the effect

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(tempSearchTerm); // Update actual searchTerm to trigger fetch
  };

  const handleClearFilters = () => {
    setTempSearchTerm('');
    setSearchTerm('');
    setSelectedType('');
    setSelectedTags('');
    // fetchContent will be triggered due to state changes if they were not already empty
  };

  return (
    <PageContainer>
      <Title>Explore Wellness Resources</Title>

      <FiltersContainer>
        <FilterGroup as="form" onSubmit={handleSearchSubmit} style={{flexBasis: '100%', marginBottom: '1rem'}}> {/* Search can take full width initially */}
          <label htmlFor="search-resources">Search by Keyword</label>
          <div style={{display: 'flex', gap: '0.5rem'}}>
            <input
                id="search-resources"
                type="text"
                placeholder="e.g., mindfulness, stress, breathing"
                value={tempSearchTerm}
                onChange={(e) => setTempSearchTerm(e.target.value)}
            />
            <button type="submit" style={{padding: '0.7rem 1rem', backgroundColor: '#19a7ce', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>Search</button>
          </div>
        </FilterGroup>

        <FilterGroup>
          <label htmlFor="type-filter">Filter by Type</label>
          <select
            id="type-filter"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {CONTENT_TYPE_FILTER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </FilterGroup>

        <FilterGroup>
          <label htmlFor="tags-filter">Filter by Tags (comma-separated)</label>
          <input
            id="tags-filter"
            type="text"
            placeholder="e.g., anxiety, sleep"
            value={selectedTags}
            onChange={(e) => setSelectedTags(e.target.value)}
          />
          {/* Note: A more advanced tag filter would use a multi-select dropdown or tag input component */}
        </FilterGroup>
        <FilterGroup style={{justifyContent: 'flex-end', alignItems: 'flex-end'}}> {/* Align button to bottom right of its group */}
             <button onClick={handleClearFilters} style={{padding: '0.7rem 1rem', backgroundColor: '#757575', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: 'auto'}}>Clear Filters</button>
        </FilterGroup>
      </FiltersContainer>

      {loading && <LoadingText>Loading resources...</LoadingText>}
      {error && <ErrorText>{error}</ErrorText>}
      {!loading && !error && (
        contentItems.length === 0 ? (
          <NoResultsText>
            No resources found matching your criteria. Try adjusting filters or{' '}
            <button onClick={handleClearFilters} style={{background: 'none', border: 'none', color: '#19a7ce', textDecoration: 'underline', cursor: 'pointer', padding: 0}}>
                clear all filters
            </button>
            .
          </NoResultsText>
        ) : (
          <ContentGrid>
            {contentItems.map(item => <ContentCard key={item.id} item={item} />)}
          </ContentGrid>
        )
      )}
    </PageContainer>
  );
};
export default ContentListPage;