// src/utils/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api'; // Use environment variable for API URL

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Function to set JWT token for subsequent requests
export const setAuthToken = (token) => {
    if (token) {
        // console.log('[api.js] Setting auth token:', token ? 'Bearer ' + token.substring(0, 10) + '...' : 'null'); // Log token being set (abbreviated)
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        // console.log('[api.js] Deleting auth token.');
        delete apiClient.defaults.headers.common['Authorization'];
    }
};

// --- Auth Service ---
export const registerUser = async (userData) => {
    // console.log('[api.js] registerUser: Sending userData:', JSON.stringify(userData, null, 2));
    try {
        const response = await apiClient.post('/auth/register', userData);
        // console.log('[api.js] registerUser: Response received:', response.data);
        return response.data; // Expected: { token, user: { id, username, email } }
    } catch (error) {
        console.error(
            '[api.js] registerUser: API Error. Status:', error.response?.status,
            'Response Data:', error.response?.data,
            'Full Error:', error
        );
        throw error; // Re-throw to be handled by calling function (e.g., in AuthContext)
    }
};

export const loginUser = async (credentials) => {
    // credentials should be { email, password }
    console.log('[api.js] loginUser: Attempting to send credentials to backend:', JSON.stringify(credentials, null, 2));
    try {
        const response = await apiClient.post('/auth/login', credentials);
        console.log('[api.js] loginUser: SUCCESS - Response received from backend:', JSON.stringify(response.data, null, 2));
        return response.data; // Expected: { token, user: { id, username, email } }
    } catch (error) {
        // This is where the 400 Bad Request will be caught
        console.error('--- [api.js] loginUser: API ERROR ---');
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('[api.js] loginUser: Error Response Status:', error.response.status);
            console.error('[api.js] loginUser: Error Response Headers:', JSON.stringify(error.response.headers, null, 2));
            console.error('[api.js] loginUser: Error Response Data (Backend Error Message):', JSON.stringify(error.response.data, null, 2)); // THIS IS KEY
        } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.error('[api.js] loginUser: No response received for the request:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('[api.js] loginUser: Error setting up the request:', error.message);
        }
        console.error('[api.js] loginUser: Full Error Config (if available):', JSON.stringify(error.config, null, 2));
        console.error('--- [api.js] loginUser: END API ERROR ---');
        throw error; // Re-throw to be handled by AuthContext and subsequently by the Login component
    }
};

// --- MoodLog Service ---
export const createMoodLog = async (moodLogData) => {
    // moodLogData: { moodRating: number, symptoms?: string[], triggers?: string[], notes?: string, loggedAt?: string (ISO) }
    // console.log('[api.js] createMoodLog: Sending moodLogData:', JSON.stringify(moodLogData, null, 2));
    try {
        const response = await apiClient.post('/moodlogs', moodLogData); // Assumes token is set
        // console.log('[api.js] createMoodLog: Response received:', response.data);
        return response.data;
    } catch (error) {
        console.error(
            '[api.js] createMoodLog: API Error. Status:', error.response?.status,
            'Response Data:', error.response?.data,
            'Full Error:', error
        );
        throw error;
    }
};

// --- MoodLog Service ---
export const getMoodLogs = async () => {
    // console.log('[api.js] getMoodLogs: Fetching mood logs...');
    try {
        const response = await apiClient.get('/moodlogs'); // Assumes token is set
        // console.log('[api.js] getMoodLogs: Response received:', response.data);
        return response.data;
    } catch (error) {
        console.error(
            '[api.js] getMoodLogs: API Error. Status:', error.response?.status,
            'Response Data:', error.response?.data,
            'Full Error:', error
        );
        throw error;
    }
};

// --- Content Service ---
export const getAllContent = async (filters = {}) => {
    // filters can be { tags: 'anxiety,stress', type: 'article', search: 'term' }
    // console.log('[api.js] getAllContent: Fetching content with filters:', filters);
    try {
        const response = await apiClient.get('/content', { params: filters });
        // console.log('[api.js] getAllContent: Response:', response.data);
        return response.data; // Expects an array of content items
    } catch (error) {
        console.error('[api.js] getAllContent: API Error:', error.response?.data || error.message || error);
        throw error;
    }
};

export const getContentItemById = async (id) => {
    // console.log(`[api.js] getContentItemById: Fetching content item with id: ${id}`);
    try {
        const response = await apiClient.get(`/content/${id}`);
        // console.log(`[api.js] getContentItemById (id: ${id}): Response:`, response.data);
        return response.data; // Expects a single content item object
    } catch (error) {
        console.error(`[api.js] getContentItemById (id: ${id}): API Error:`, error.response?.data || error.message || error);
        throw error;
    }
};

// src/utils/api.js
// ...
export const getPersonalizedRecommendations = async () => {
    // console.log('[api.js] getPersonalizedRecommendations: Fetching...');
    try {
        // Adjust endpoint if you put it in contentRoutes.js vs recommendationRoutes.js
        const response = await apiClient.get('/recommendations'); // Or '/content/recommendations'
        // console.log('[api.js] getPersonalizedRecommendations: Response:', response.data);
        return response.data; // Expected: { recommendations: [], reason: "..." }
    } catch (error) {
        console.error('[api.js] getPersonalizedRecommendations: API Error:', error.response?.data || error.message || error);
        throw error;
    }
};

export const logContentInteraction = async (contentItemId, interactionData) => {
    // interactionData: { rating, isHelpful, feedbackText, viewed }
    try {
        const response = await apiClient.post(`/content/${contentItemId}/interactions`, interactionData);
        return response.data;
    } catch (error) {
        console.error(`[api.js] logContentInteraction (id: ${contentItemId}): API Error:`, error.response?.data || error.message || error);
        throw error;
    }
};

export const getUserInteractionForItem = async (contentItemId) => {
    try {
        const response = await apiClient.get(`/content/${contentItemId}/interactions/me`);
        return response.data;
    } catch (error) {
        console.error(`[api.js] getUserInteractionForItem (id: ${contentItemId}): API Error:`, error.response?.data || error.message || error);
        // If 404, it might mean no interaction yet, which is fine.
        if (error.response && error.response.status === 404) {
            return { rating: null, isHelpful: null, feedbackText: '' }; // Default if no interaction
        }
        throw error;
    }
};

// --- UserProfile Service ---
export const getProfile = async () => {
    // console.log('[api.js] getProfile: Fetching user profile...');
    try {
        const response = await apiClient.get('/profile'); // Assumes token is set via setAuthToken
        // console.log('[api.js] getProfile: Response received:', response.data);
        return response.data;
    } catch (error) {
        console.error('[api.js] getProfile: API Error:', error.response?.data || error.message || error);
        throw error;
    }
};

export const updateProfile = async (profileData) => {
    // profileData: { areas_of_concern?: string[], preferred_content_types?: string[] }
    // console.log('[api.js] updateProfile: Sending profileData:', JSON.stringify(profileData, null, 2));
    try {
        const response = await apiClient.put('/profile', profileData);
        // console.log('[api.js] updateProfile: Response received:', response.data);
        return response.data;
    } catch (error) {
        console.error('[api.js] updateProfile: API Error:', error.response?.data || error.message || error);
        throw error;
    }
};

// If you implement admin features on frontend for content creation:
// export const createContentItem = async (contentData) => { /* ... apiClient.post ... */ }
// export const updateContentItem = async (id, updateData) => { /* ... apiClient.put ... */ }
// export const deleteContentItem = async (id) => { /* ... apiClient.delete ... */ }



// --- Example: Task Service (if you have Tasks.js) ---
// export const getTasks = async () => {
//     try {
//         const response = await apiClient.get('/tasks');
//         return response.data;
//     } catch (error) {
//         console.error('[api.js] getTasks: API Error:', error.response || error);
//         throw error;
//     }
// };

// export const createTask = async (taskData) => {
//     try {
//         const response = await apiClient.post('/tasks', taskData);
//         return response.data;
//     } catch (error) {
//         console.error('[api.js] createTask: API Error:', error.response || error);
//         throw error;
//     }
// };

// Add other API functions for VideoArticles, Chatbot, etc. as needed, with similar try/catch blocks.

export default apiClient;