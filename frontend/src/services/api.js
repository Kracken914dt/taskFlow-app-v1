import axios from 'axios';

const envBackendUrl = import.meta.env.BACKEND_URL;
const normalizedBackendUrl = envBackendUrl ? envBackendUrl.replace(/\/$/, '') : '';
const backendUrl = normalizedBackendUrl
  ? (normalizedBackendUrl.endsWith('/api') ? normalizedBackendUrl : `${normalizedBackendUrl}/api`)
  : '/api';

const api = axios.create({
  baseURL: backendUrl.replace(/\/$/, ''),
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: adjuntar token automáticamente
api.interceptors.request.use(config => {
  const token = localStorage.getItem('tf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor: manejar 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('tf_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
