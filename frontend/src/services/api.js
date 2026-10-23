import axios from 'axios';

/**
 * Determine and normalize the API base URL.
 * Supports:
 * - https://your-voroa-backend.app -> https://your-voroa-backend.app/api
 * - https://your-voroa-backend.app/api -> https://your-voroa-backend.app/api
 * - Local dev fallback to http://localhost:5000/api
 */
export function resolveApiBaseUrl() {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();

  if (envUrl) {
    let cleanUrl = envUrl.replace(/\/+$/, '');
    if (!cleanUrl.endsWith('/api')) {
      cleanUrl += '/api';
    }
    return cleanUrl;
  }

  // Running in browser in production (e.g. deployed on Vercel without env var)
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return '/api';
  }

  return 'http://localhost:5000/api';
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Response error handler to extract meaningful error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let userMessage = 'Failed to communicate with API server.';

    if (error.response) {
      const data = error.response.data;
      if (data?.error && typeof data.error === 'string') {
        userMessage = data.error;
      } else if (data?.message && typeof data.message === 'string') {
        userMessage = data.message;
      } else if (Array.isArray(data?.errors) && data.errors.length > 0) {
        userMessage = data.errors.map((e) => e.msg || e.message || String(e)).join(', ');
      } else if (error.response.status === 404) {
        userMessage = `API endpoint not found: ${error.config?.url || ''}`;
      } else if (error.response.status >= 500) {
        userMessage = `Server error (${error.response.status}). Please try again later.`;
      }
    } else if (error.code === 'ECONNABORTED') {
      userMessage = 'Request timed out waiting for backend server.';
    } else if (error.request) {
      userMessage = 'Network error: Backend server is unreachable or CORS blocked.';
    } else if (error.message) {
      userMessage = error.message;
    }

    error.userMessage = userMessage;
    return Promise.reject(error);
  }
);

export default api;
