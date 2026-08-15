import axios from 'axios';

// Note: the backend actually runs on port 4000 (backend/.env's PORT), not
// 3000 — set VITE_API_URL if yours differs. This dev server itself runs
// on Vite's default 5173, so the two never collide.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
