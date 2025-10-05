import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Set token for all requests
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// --- Auth API ---
export const registerUser = async (userData) => {
  try {
    const res = await apiClient.post('/auth/register', userData);
    return res.data; // { token, user }
  } catch (err) {
    console.error('[API] registerUser error:', err.response?.data || err.message);
    throw err;
  }
};

export const loginUser = async (credentials) => {
  try {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data; // { token, user }
  } catch (err) {
    console.error('[API] loginUser error:', err.response?.data || err.message);
    throw err;
  }
};

// --- MoodLog API ---
export const createMoodLog = async (data) => {
  try {
    const res = await apiClient.post('/moodlogs', data);
    return res.data;
  } catch (err) {
    console.error('[API] createMoodLog error:', err.response?.data || err.message);
    throw err;
  }
};

export const getMoodLogs = async () => {
  try {
    const res = await apiClient.get('/moodlogs');
    return res.data;
  } catch (err) {
    console.error('[API] getMoodLogs error:', err.response?.data || err.message);
    throw err;
  }
};

// --- Content API ---
export const getAllContent = async (filters = {}) => {
  try {
    const res = await apiClient.get('/content', { params: filters });
    return res.data;
  } catch (err) {
    console.error('[API] getAllContent error:', err.response?.data || err.message);
    throw err;
  }
};

export const getContentItemById = async (id) => {
  try {
    const res = await apiClient.get(`/content/${id}`);
    return res.data;
  } catch (err) {
    console.error(`[API] getContentItemById (${id}) error:`, err.response?.data || err.message);
    throw err;
  }
};

export const getPersonalizedRecommendations = async () => {
  try {
    const res = await apiClient.get('/recommendations');
    return res.data;
  } catch (err) {
    console.error('[API] getPersonalizedRecommendations error:', err.response?.data || err.message);
    throw err;
  }
};

export const logContentInteraction = async (contentId, interactionData) => {
  try {
    const res = await apiClient.post(`/content/${contentId}/interactions`, interactionData);
    return res.data;
  } catch (err) {
    console.error(`[API] logContentInteraction (${contentId}) error:`, err.response?.data || err.message);
    throw err;
  }
};

export const getUserInteractionForItem = async (contentId) => {
  try {
    const res = await apiClient.get(`/content/${contentId}/interactions/me`);
    return res.data;
  } catch (err) {
    if (err.response?.status === 404) return { rating: null, isHelpful: null, feedbackText: '' };
    console.error(`[API] getUserInteractionForItem (${contentId}) error:`, err.response?.data || err.message);
    throw err;
  }
};

// --- User Profile API ---
export const getProfile = async () => {
  try {
    const res = await apiClient.get('/profile');
    return res.data;
  } catch (err) {
    console.error('[API] getProfile error:', err.response?.data || err.message);
    throw err;
  }
};

export const updateProfile = async (profileData) => {
  try {
    const res = await apiClient.put('/profile', profileData);
    return res.data;
  } catch (err) {
    console.error('[API] updateProfile error:', err.response?.data || err.message);
    throw err;
  }
};

// in src/utils/api.js (append)
export const getTasks = async (filters = {}) => {
  // filters: { mood: 'stress', search: 'term' }
  const response = await apiClient.get('/tasks', { params: filters });
  return response.data;
};

export const completeTask = async (taskId) => {
  const response = await apiClient.post(`/tasks/${taskId}/complete`);
  return response.data; // { msg, completionId, updated: {points, currentStreak, longestStreak} }
};

export const getMyTaskStats = async () => {
  const response = await apiClient.get('/tasks/me/stats');
  return response.data;
};


export default apiClient;
