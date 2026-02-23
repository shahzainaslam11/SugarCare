import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {store} from '../store';
import {refreshAccessToken} from '../slices/authSlice';
import {clearSecureCredentials} from '../../services/secureStorage';
import {triggerSessionExpired} from '../../services/sessionManager';

const api = axios.create({
  baseURL: 'https://sugarcare.cloud/api/v1', // 👈 your base API URL
  headers: {
    accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor to automatically add auth token
api.interceptors.request.use(
  async config => {
    // FormData needs multipart/form-data with boundary - remove Content-Type
    // so axios sets it automatically (application/json breaks file uploads)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Get token from Redux store (more reliable than AsyncStorage)
    const state = store.getState();
    const token = state.auth?.accessToken;

    // If token exists, add it to headers
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle 401 errors and token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({resolve, reject});
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const state = store.getState();
      const refreshToken = state.auth?.refreshToken;

      // Try to refresh token if refresh token exists
      if (refreshToken) {
        try {
          const refreshResult = await store.dispatch(refreshAccessToken());
          
          if (refreshAccessToken.fulfilled.match(refreshResult)) {
            const newToken = refreshResult.payload.access_token;
            
            // Update the original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            
            // Process queued requests
            processQueue(null, newToken);
            isRefreshing = false;
            
            // Retry the original request
            return api(originalRequest);
          } else {
            // Refresh failed, clear auth and logout
            throw new Error('Token refresh failed');
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;
          await clearSecureCredentials();
          await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user', 'aiConsent']);
          store.dispatch({type: 'auth/logout'});
          triggerSessionExpired();
          return Promise.reject(refreshError);
        }
      } else {
        isRefreshing = false;
        await clearSecureCredentials();
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user', 'aiConsent']);
        store.dispatch({type: 'auth/logout'});
        triggerSessionExpired();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
