import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

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
export const authVerify = (token) => API.get('/api/user/me', {
  headers: { Authorization: `Bearer ${token}` }
});
export const authGetMe = () => API.get('/api/user/me');
export const authLogin = (data) => API.post('/api/auth/login', data);
export const authRegister = (data) => API.post('/api/auth/register', data);
export const authGoogle = (idToken) => API.post('/api/auth/google', { idToken });
export const authCompleteProfile = (data) => API.post('/api/auth/complete-profile', data);
export const authUpdateProfile = (data) => API.put('/api/auth/complete-profile', data);

// ── User & Journey APIs ───────────────────────────────────
export const getChecklist = (userId) => API.get(`/api/checklist/${userId}`);
export const getJourney = (userId) => API.get(`/api/journey/${userId}`);
export const getElectionSteps = (region = 'India') => API.get(`/api/election/steps?region=${region}`);

// Interactive Chat
export const sendChatMessage = (userId, message) => API.post('/api/chat', { message });
export const getChatHistory = (userId) => API.get(`/api/chat/${userId}/history`);

export const updateChecklistItem = (userId, itemKey, completed) => API.post('/api/checklist/update', { userId, itemKey, completed });

// Timeline & Scenarios
export const getTimeline = (userId) => API.get(`/api/timeline/${userId}`);
export const getScenarios = () => API.get('/api/scenario/list');
export const runScenario = (userId, scenarioType) => API.post('/api/scenario', { userId, scenarioType });

// Booth Guidance
export const getBoothGuide = (userId, pincode, area) => API.post('/api/booth', { userId, pincode, area });

// Quiz APIs
export const getElectionQuiz = (topic = 'Election Process') => API.get(`/api/quiz?topic=${topic}`);
export const getQuiz = () => API.get('/api/quiz');
export const submitQuiz = (userId, answers) => API.post('/api/quiz/submit', { userId, answers });

// Health check
export const getHealth = () => API.get('/api/health');

export default API;
