// src/components/Mood/MoodLogForm.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { createMoodLog } from '../../utils/api'; // Adjust path

// Define your mood scale and available symptoms
// Define your mood scale and available symptoms
const MOOD_OPTIONS = [
    { value: 1, label: '\u{1F622} Very Poor' },    // 😔 Pensive Face
    { value: 2, label: '\u{1F641} Poor' },         // 🙁 Slightly Frowning Face
    { value: 3, label: '\u{1F610} Okay' },        // 😐 Neutral Face
    { value: 4, label: '\u{1F642} Good' },        // 🙂 Slightly Smiling Face
    { value: 5, label: '\u{1F60A} Very Good' },    // 😊 Smiling Face with Smiling Eyes
];

const AVAILABLE_SYMPTOMS = [
    "anxious", "stressed", "irritable", "sad", "lonely", "tired",
    "low_energy", "unmotivated", "overwhelmed", "restless", "calm",
    "happy", "energetic", "focused", "grateful", "hopeful"
];
// You can expand this list or fetch it from an API later

const FormContainer = styled.form`
  background-color: #f9f9f9;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.07);
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
`;

const MoodRatingSelector = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 1rem;
  button {
    background: none;
    border: 2px solid #ddd;
    color: #555;
    padding: 0.5rem 0.8rem;
    border-radius: 20px;
    cursor: pointer;
    font-size: 1.5rem; /* Emoji size */
    font-family: "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif;
    transition: transform 0.2s, border-color 0.2s;
    &:hover {
      transform: scale(1.1);
    }
    &.selected {
      border-color: #19a7ce; /* Primary color */
      background-color: #e0f7fa; /* Light primary tint */
    }
  }
`;

const SymptomSelector = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  button {
    background-color: #e0e0e0;
    color: #333;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 16px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background-color 0.2s;
    &:hover {
      background-color: #d0d0d0;
    }
    &.selected {
      background-color: #19a7ce; /* Primary color */
      color: white;
    }
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 80px;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: #19a7ce;
    box-shadow: 0 0 0 2px rgba(25, 167, 206, 0.2);
  }
`;

const SubmitButton = styled.button`
  /* Use styles similar to your AddTaskForm SubmitButton or Login button */
  padding: 0.85rem 1.5rem;
  background-color: #19a7ce;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: block; /* Make it block to center with margin */
  margin: 1rem auto 0;
  &:hover { background-color: #146c94; }
  &:disabled { background-color: #ccc; cursor: not-allowed; }
`;

const ErrorMessage = styled.p` /* Similar to your Login.js Error styled component */
  background-color: #ffebee; color: #c62828; border: 1px solid #ef9a9a;
  border-left: 4px solid #d32f2f; padding: 0.75rem; margin-bottom: 1rem;
  font-size: 0.9rem; border-radius: 4px;
`;
 const SuccessMessage = styled.p`
  background-color: #e8f5e9; color: #2e7d32; border: 1px solid #a5d6a7;
  border-left: 4px solid #43a047; padding: 0.75rem; margin-bottom: 1rem;
  font-size: 0.9rem; border-radius: 4px;
`;


const MoodLogForm = ({ onMoodLogged }) => {
  const [moodRating, setMoodRating] = useState(null); // Start with null, require selection
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSymptomToggle = (symptom) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (moodRating === null) {
      setError("Please select your current mood rating.");
      return;
    }
    setIsSubmitting(true);
    try {
      const moodLogData = {
        moodRating,
        symptoms: selectedSymptoms,
        notes,
        // loggedAt: new Date().toISOString() // Or let backend default
      };
      await createMoodLog(moodLogData);
      setSuccess('Mood logged successfully!');
      // Reset form
      setMoodRating(null);
      setSelectedSymptoms([]);
      setNotes('');
      if (onMoodLogged) { // Callback to parent component (e.g., to refresh a list of logs)
        onMoodLogged();
      }
      setTimeout(() => setSuccess(''), 3000); // Clear success message
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.msg || err.message || "Failed to log mood.";
      setError(errorMsg);
      console.error("Failed to log mood from form:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <FormGroup>
        <Label>How are you feeling right now?</Label>
        <MoodRatingSelector>
          {MOOD_OPTIONS.map(opt => (
            <button
  type="button"
  key={opt.value}
  className={moodRating === opt.value ? 'selected' : ''}
  onClick={() => setMoodRating(opt.value)}
  title={opt.label.substring(opt.label.charAt(0).length).trim()} // Text part
>
  {opt.label.charAt(0)} {/* Emoji part */}
</button>
          ))}
        </MoodRatingSelector>
      </FormGroup>

      <FormGroup>
        <Label>Any specific feelings or symptoms? (Optional)</Label>
        <SymptomSelector>
          {AVAILABLE_SYMPTOMS.map(symptom => (
            <button
              type="button"
              key={symptom}
              className={selectedSymptoms.includes(symptom) ? 'selected' : ''}
              onClick={() => handleSymptomToggle(symptom)}
            >
              {symptom.charAt(0).toUpperCase() + symptom.slice(1)}
            </button>
          ))}
        </SymptomSelector>
      </FormGroup>

      <FormGroup>
        <Label>Any notes or thoughts? (Optional)</Label>
        <TextArea
          placeholder="e.g., Feeling a bit overwhelmed with work today..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isSubmitting}
        />
      </FormGroup>

      <SubmitButton type="submit" disabled={isSubmitting || moodRating === null}>
        {isSubmitting ? 'Logging...' : 'Log My Mood'}
      </SubmitButton>
    </FormContainer>
  );
};

export default MoodLogForm;