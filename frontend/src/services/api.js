import axios from 'axios';
import { BACKEND_API } from './backend_api';

const api = axios.create({
  baseURL: BACKEND_API.BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
