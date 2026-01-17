import axios from 'axios';

// Base API instance
const apiClient = axios.create({
  baseURL: 'http://172.16.10.248:5000/api', // Updated to match server URL
  timeout: 30000,
});

// Add request interceptor to include token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Admin login function
export const loginAdmin = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/admin/login', credentials);
    return response.data.data; // Return the data part which contains token and admin info
  } catch (error) {
    throw error;
  }
};

// Get current user profile
export const getMe = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export default apiClient;