// src/pages/ProfilePage.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/authContext'; // Adjust path
import { getProfile, updateProfile } from '../utils/api'; // Adjust path

// Define options for multi-selects (can be moved to a constants file)
const AREAS_OF_CONCERN_OPTIONS = [
    "anxiety", "stress", "depression", "sleep", "motivation",
    "focus", "relationships", "self-esteem", "grief", "anger", "burnout"
].sort();

const CONTENT_TYPE_OPTIONS = [
    { value: "article", label: "Articles" },
    { value: "video", label: "Videos" },
    { value: "exercise", label: "Guided Exercises" },
];

// --- Styled Components ---
const PageContainer = styled.div`
  max-width: 700px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
`;

const Title = styled.h1`
  text-align: center;
  color: #146c94;
  margin-bottom: 2rem;
`;

const Form = styled.form``;

const FormGroup = styled.div`
  margin-bottom: 2rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600; /* Bolder label */
  margin-bottom: 0.75rem;
  color: #333;
  font-size: 1.05rem;
`;

const MultiSelectContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem; /* Spacing between buttons */
`;

const ToggleButton = styled.button`
  background-color: ${props => props.selected ? '#19a7ce' : '#e9ecef'};
  color: ${props => props.selected ? 'white' : '#495057'};
  border: 1px solid ${props => props.selected ? '#19a7ce' : '#ced4da'};
  padding: 0.6rem 1.2rem;
  border-radius: 20px; /* Pill shape */
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  font-weight: 500;

  &:hover {
    border-color: ${props => props.selected ? '#146c94' : '#adb5bd'};
    background-color: ${props => props.selected ? '#146c94' : '#f8f9fa'};
  }
`;

const SubmitButton = styled.button`
  display: block;
  width: 100%;
  max-width: 250px; /* Max width for button */
  margin: 2rem auto 0; /* Center button */
  padding: 0.9rem 1.5rem;
  background-color: #19a7ce;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.05rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  &:hover { background-color: #146c94; }
  &:disabled { background-color: #ccc; cursor: not-allowed; }
`;

const Message = styled.p`
  text-align: center;
  padding: 0.75rem;
  margin-top: 1rem;
  border-radius: 4px;
  font-weight: 500;
  &.success { background-color: #e8f5e9; color: #2e7d32; border: 1px solid #a5d6a7;}
  &.error { background-color: #ffebee; color: #c62828; border: 1px solid #ef9a9a;}
`;
// --- End Styled Components ---

const ProfilePage = () => {
  const { user, token } = useAuth(); // Assuming token is available for API calls
  const [profileData, setProfileData] = useState({
    areas_of_concern: [],
    preferred_content_types: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUserProfile = useCallback(async () => {
    if (!token) { // Ensure token exists before fetching
        setLoading(false);
        setError("You must be logged in to view your profile."); // Should be handled by ProtectedRoute
        return;
    }
    setLoading(true); setError('');
    try {
      const data = await getProfile();
      setProfileData({
        areas_of_concern: data.areas_of_concern || [],
        preferred_content_types: data.preferred_content_types || [],
      });
    } catch (err) {
      setError("Failed to load your profile. Please try again later.");
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]); // Depend on token to re-fetch if user logs in/out

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleToggleSelection = (field, value) => {
    setProfileData(prev => {
      const currentValues = prev[field] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(item => item !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
    setSuccess(''); // Clear success message on any change before saving
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setSaving(true);
    try {
      const payload = {
        areas_of_concern: profileData.areas_of_concern,
        preferred_content_types: profileData.preferred_content_types,
      };
      await updateProfile(payload);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || err.message || "Failed to update profile.";
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageContainer><Title>Loading Your Profile...</Title></PageContainer>;
  // Error during initial load
  if (error && !profileData.areas_of_concern.length && !profileData.preferred_content_types.length) {
    return <PageContainer><Title>Profile</Title><Message className="error">{error}</Message></PageContainer>;
  }


  return (
    <PageContainer>
      <Title>Your Profile & Preferences</Title>
      <p style={{textAlign: 'center', marginBottom: '2rem', color: '#555'}}>
        Help us personalize your experience by selecting your areas of interest and preferred content types.
      </p>
      {/* Display error from save attempt, not initial load error if data is present */}
      {error && (profileData.areas_of_concern.length > 0 || profileData.preferred_content_types.length > 0) &&
        <Message className="error">{error}</Message>
      }
      {success && <Message className="success">{success}</Message>}

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>What areas are you focusing on for your well-being?</Label>
          <MultiSelectContainer>
            {AREAS_OF_CONCERN_OPTIONS.map(area => (
              <ToggleButton
                type="button"
                key={area}
                selected={profileData.areas_of_concern.includes(area)}
                onClick={() => handleToggleSelection('areas_of_concern', area)}
              >
                {area.charAt(0).toUpperCase() + area.slice(1)}
              </ToggleButton>
            ))}
          </MultiSelectContainer>
        </FormGroup>

        <FormGroup>
          <Label>What types of resources do you prefer?</Label>
          <MultiSelectContainer>
            {CONTENT_TYPE_OPTIONS.map(opt => (
              <ToggleButton
                type="button"
                key={opt.value}
                selected={profileData.preferred_content_types.includes(opt.value)}
                onClick={() => handleToggleSelection('preferred_content_types', opt.value)}
              >
                {opt.label}
              </ToggleButton>
            ))}
          </MultiSelectContainer>
        </FormGroup>

        <SubmitButton type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Preferences"}
        </SubmitButton>
      </Form>
    </PageContainer>
  );
};

export default ProfilePage;