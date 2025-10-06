import axios, { AxiosHeaders } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const getToken = () => localStorage.getItem('token');

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {},
});
apiClient.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const registerUser = async (userData) => {
  try { const res = await apiClient.post('/auth/register', userData); return res.data; } catch (err) { console.error(err); throw err; }
};

export const loginUser = async (credentials) => {
  try { const res = await apiClient.post('/auth/login', credentials); return res.data; } catch (err) { console.error(err); throw err; }
};

export const createMoodLog = async (data) => {
  try { const res = await apiClient.post('/moodlogs', data); return res.data; } catch (err) { console.error(err); throw err; }
};

export const getMoodLogs = async () => {
  try { const res = await apiClient.get('/moodlogs'); return res.data; } catch (err) { console.error(err); throw err; }
};

export const getAllContent = async (filters = {}) => {
  try { const res = await apiClient.get('/content', { params: filters }); return res.data; } catch (err) { console.error(err); throw err; }
};

export const getContentItemById = async (id) => {
  try { const res = await apiClient.get(`/content/${id}`); return res.data; } catch (err) { console.error(err); throw err; }
};

export const getPersonalizedRecommendations = async () => {
  try { const res = await apiClient.get('/recommendations'); return res.data; } catch (err) { console.error(err); throw err; }
};

export const logContentInteraction = async (contentId, interactionData) => {
  try { const res = await apiClient.post(`/content/${contentId}/interactions`, interactionData); return res.data; } catch (err) { console.error(err); throw err; }
};

export const getUserInteractionForItem = async (contentId) => {
  try { const res = await apiClient.get(`/content/${contentId}/interactions/me`); return res.data; } catch (err) { if (err.response?.status === 404) return { rating: null, isHelpful: null, feedbackText: '' }; console.error(err); throw err; }
};

export const getProfile = async () => { try { const res = await apiClient.get('/profile'); return res.data; } catch (err) { console.error(err); throw err; } };
export const updateProfile = async (profileData) => { try { const res = await apiClient.put('/profile', profileData); return res.data; } catch (err) { console.error(err); throw err; } };

export const getTasks = async (filters = {}) => {
  const response = await apiClient.get('/tasks', { params: filters });
  return response.data;
};

export const completeTask = async (taskId) => {
  const response = await apiClient.post(`/tasks/${taskId}/complete`);
  return response.data;
};