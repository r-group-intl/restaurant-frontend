import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

const api = axios.create({ 
  baseURL: API_BASE,
  timeout: 30000 // 30 second timeout instead of default 10 seconds
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
   
  // Add domain header - get from localStorage or default to restaurant
  const domain = localStorage.getItem('domain') || 'restaurant';
  config.headers['x-domain'] = domain;
  
  return config;
});

export default api;
