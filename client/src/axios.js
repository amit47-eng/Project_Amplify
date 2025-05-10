import axios from 'axios';
import store from './store/index';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.user.token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      store.dispatch({ type: 'user/logout' });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
