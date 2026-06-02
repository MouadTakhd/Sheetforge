import axios from 'axios';

// Create a base instance pointing to your Symfony backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Automatically attach the JWT token if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sheetforge_jwt_token');
  console.log(token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;