import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

apiClient.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('vybeboard_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

apiClient.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || 'Something went wrong. Please try again.';
    const code = err.response?.data?.code || 'UNKNOWN_ERROR';
    return Promise.reject({ message, code, status: err.response?.status, details: err.response?.data?.details });
  }
);
