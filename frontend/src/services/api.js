/**
 * api.js — Axios base instance for CareerTwin AI backend
 * Base URL: http://localhost:8000/api
 * No real API calls are made yet. This is a prepared foundation.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ---------------------------------------------------------------------------
// Request interceptor — attach auth token when available (future use)
// ---------------------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('careertwin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Response interceptor — centralised error handling (future use)
// ---------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized globally when auth is implemented
    if (error.response?.status === 401) {
      localStorage.removeItem('careertwin_token');
    }
    return Promise.reject(error);
  }
);

export default api;
