import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://sugarcare.cloud/api/v1/auth';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    accept: 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

export const authAPI = {
  login: (email, password) => api.post('/login', {email, password}),

  register: userData => api.post('/register', userData),

  forgotPassword: email => api.post('/forgot-password', {email}),

  resetPassword: (code, confirm_password, email, new_password) =>
    api.post('/reset-password', {code, confirm_password, email, new_password}),

  logout: (access_token, refresh_token) =>
    api.post('/logout', {access_token, refresh_token}),
};

export default api;
