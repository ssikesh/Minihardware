import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: `${baseURL.replace(/\/$/, '')}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attaches Bearer token if stored in localStorage
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('minihardware_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extracts friendly messages and handles 401s
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; detail?: string | any[]; success?: boolean }>) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // Handle token expiration / unauthorized
      if (status === 401) {
        localStorage.removeItem('minihardware_token');
        localStorage.removeItem('minihardware_user');
        // If not already on login page, dispatch custom event or redirect
        if (!window.location.pathname.includes('/login')) {
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
      }

      // Format clean error message
      let message = 'An unexpected error occurred. Please try again.';
      if (data?.message) {
        message = data.message;
      } else if (typeof data?.detail === 'string') {
        message = data.detail;
      } else if (Array.isArray(data?.detail) && data.detail[0]?.msg) {
        message = data.detail[0].msg;
      }

      // Custom stock limit error formatting
      if (status === 400 && message.toLowerCase().includes('exceeds available stock')) {
        // Keep message as returned by backend or friendly
      }

      return Promise.reject(new Error(message));
    } else if (error.request) {
      return Promise.reject(new Error('Unable to connect to MiniHardware server. Please check your connection.'));
    }

    return Promise.reject(error);
  }
);

export default apiClient;
