import axios from 'axios';

// const API_URL = "http://localhost:3000";
const API_URL = "https://king-prawn-app-iwexx.ondigitalocean.app";
// const API_URL = "http://64.23.199.147:3000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getSessions = async () => {
  const response = await api.get('/sessions');
  return response.data;
};

export const connectSession = async (clientId) => {
  const response = await api.post('/session', { clientId });
  return response.data;
};

export const sendMessage = async (clientId, number, message) => {
  const response = await api.post('/send', { clientId, phone: number, message });
  return response.data;
};

export const logoutSession = async (clientId) => {
  const response = await api.post('/logout', { clientId });
  return response.data;
};

export const sendBulkMessages = async (clientId, numbers, message, delay = 1000) => {
  // Logic mostly client-side for iteration, but we can expose a helper here if backend supports it.
  // For now, keeping it as individual calls wrapper or if we implement a bulk endpoint later.
  // We'll stick to the existing loop logic in the component but moved to a service function if possible,
  // or just use sendMessage in a loop.
  // Actually, the original BulkSender likely did a loop. Let's keep it simple here.
};

export const BACKEND_URL = API_URL; // Export for socket connection
export default api;
