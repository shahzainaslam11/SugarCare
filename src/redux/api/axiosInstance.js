import axios from 'axios';

const api = axios.create({
  baseURL: 'https://sugarcare.cloud/api/v1', // 👈 your base API URL
  headers: {
    accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export default api;
