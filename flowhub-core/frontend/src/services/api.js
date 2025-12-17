/**
 * API Client
 * 
 * Centralized HTTP client with interceptors for token management.
 * Handles automatic token refresh on 401 errors.
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Important: sends httpOnly cookies (refresh token)
});

// Token refresh state
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

// Function to get current access token from context
// This will be set by AuthContext
let getAccessToken = () => null;
let setAccessToken = null;
let refreshTokenFunction = null;
let clearAuthFunction = null;

export const setTokenFunctions = (getToken, setToken, refreshFn, clearAuthFn) => {
  getAccessToken = getToken;
  setAccessToken = setToken;
  refreshTokenFunction = refreshFn;
  clearAuthFunction = clearAuthFn;
};

// Request interceptor - add access token to headers
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh token (refresh token sent automatically via httpOnly cookie)
        const newToken = await refreshTokenFunction();
        
        if (newToken) {
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          // Refresh failed (no valid refresh token) - clear auth
          // DO NOT perform window.location.href redirect here as it breaks React Router logic
          // and causes the infinite loop you saw on Vercel.
          processQueue(new Error('Session expired'), null);
          if (clearAuthFunction) {
            clearAuthFunction();
          }
          return Promise.reject(new Error('Session expired'));
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear auth state on any refresh error
        if (clearAuthFunction) {
          clearAuthFunction();
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

