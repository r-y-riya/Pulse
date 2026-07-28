import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('momentum_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('momentum_refresh_token');
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        // Call token refresh route
        const res = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
        const { token, refreshToken: newRefresh } = res.data;

        localStorage.setItem('momentum_token', token);
        localStorage.setItem('momentum_refresh_token', newRefresh);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // Clear storage and logout user on refresh failure
        localStorage.removeItem('momentum_token');
        localStorage.removeItem('momentum_refresh_token');
        localStorage.removeItem('momentum_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
