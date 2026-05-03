import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const API = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Auth Token Interceptor ─────────────────────────────────
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('votepath_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth APIs ─────────────────────────────────────────────
export const authVerify = (token) => API.get('/user/me', {
  headers: { Authorization: `Bearer ${token}` }
});
export const authGetMe = () => API.get('/user/me');
export const authLogin = (data) => API.post('/auth/login', data);
export const authRegister = (data) => API.post('/auth/register', data);
export const authGoogle = (idToken) => API.post('/auth/google', { idToken });

// ── User & Journey APIs ───────────────────────────────────
export const getChecklist = (userId) => API.get(`/checklist/${userId}`);
export const getJourney = (userId) => API.get(`/journey/${userId}`);
export const getElectionSteps = (region = 'India') => API.get(`/election/steps?region=${region}`);

// Interactive Chat
export const sendChatMessage = (userId, message) => API.post('/chat', { message });
export const getChatHistory = (userId) => API.get(`/chat/${userId}/history`);

// Quiz APIs
export const getElectionQuiz = (topic = 'Election Process') => API.get(`/quiz?topic=${topic}`);
export const getQuiz = () => API.get('/quiz');

// Health check
export const getHealth = () => API.get('/health');

export default API;
