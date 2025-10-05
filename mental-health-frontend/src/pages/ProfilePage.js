// src/pages/ProfilePage.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/authContext';
import { getProfile, updateProfile } from '../utils/api';
import NavBar from "../components/NavBar";
import bgImg from '../assets/img/bg.jpg'; // background image

// Options
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
  color: #6B1E77; /* consistent with Home */
  margin-bottom: 1rem;
`;

const Form = styled.form``;

const FormGroup = styled.div`margin-bottom: 2rem;`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #333;
  font-size: 1.05rem;
`;

const MultiSelectContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const ToggleButton = styled.button`
  background-color: ${props => props.selected ? 'rgb(199, 121, 190)' : '#e9ecef'};
  color: ${props => props.selected ? 'white' : '#495057'};
  border: 1px solid ${props => props.selected ? 'rgb(199, 121, 190)' : '#ced4da'};
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  font-weight: 500;

  &:hover {
    border-color: ${props => props.selected ? 'rgba(139, 75, 131, 1)' : '#adb5bd'};
    background-color: ${props => props.selected ? 'rgba(139, 75, 131, 1)' : '#f8f9fa'};
  }
`;

const SubmitButton = styled.button`
  display: block;
  width: 100%;
  max-width: 250px;
  margin: 2rem auto 0;
  padding: 0.9rem 1.5rem;
  background-color: rgb(199, 121, 190);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.05rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  &:hover { background-color: rgba(139, 75, 131, 1); }
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
  const { user, token } = useAuth();
  const [profileData, setProfileData] = useState({
    areas_of_concern: [],
    preferred_content_types: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUserProfile = useCallback(async () => {
    if (!token) { setLoading(false); setError("You must be logged in."); return; }
    setLoading(true); setError('');
    try {
      const data = await getProfile();
      setProfileData({
        areas_of_concern: data.areas_of_concern || [],
        preferred_content_types: data.preferred_content_types || [],
      });
    } catch (err) {
      setError("Failed to load profile.");
      console.error("Profile fetch error:", err);
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchUserProfile(); }, [fetchUserProfile]);

  const handleToggleSelection = (field, value) => {
    setProfileData(prev => {
      const currentValues = prev[field] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(item => item !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
    setSuccess('');
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
      const errorMsg = err.response?.data?.msg || err.message || "Failed to update profile.";
      setError(errorMsg);
    } finally { setSaving(false); }
  };

  if (!user) return null; // ProtectedRoute should handle redirect
  if (loading) return <PageWrapper><GlassContainer><Title>Loading Profile...</Title></GlassContainer></PageWrapper>;

  return (
    <PageWrapper>
      <GlassContainer>
        <Title>Your Profile & Preferences</Title>
        <p style={{textAlign: 'center', marginBottom: '2rem', color: '#555'}}>
          Help us personalize your experience by selecting your areas of interest and preferred content types.
        </p>
        {error && <Message className="error">{error}</Message>}
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
      </GlassContainer>
    </PageWrapper>
  );
};

export default ProfilePage;
