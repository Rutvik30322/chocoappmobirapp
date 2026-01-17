import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL - Update this with your backend URL
// Use your computer's IP address for testing on physical device
// Use localhost for emulator/simulator
const API_BASE_URL = __DEV__ 
  ? 'http://172.16.10.248:5000/api' // Replace with your IP address
  : 'http://172.16.10.248:5000/api';

console.log('🔧 API Configuration:');
console.log('Base URL:', API_BASE_URL);
console.log('Environment:', __DEV__ ? 'Development' : 'Production');

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  async (config) => {
    // Log all outgoing requests in development
    if (__DEV__) {
      console.log('\n🚀 === API REQUEST ===');
      console.log('URL:', (config.baseURL || '') + (config.url || ''));
      console.log('Method:', config.method?.toUpperCase());
      console.log('Data:', config.data);
      console.log('===================\n');
    }
    
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    if (__DEV__) {
      console.log('❌ Request interceptor error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (__DEV__) {
      console.log('\n✅ === API SUCCESS ===');
      console.log('URL:', response.config.url);
      console.log('Status:', response.status);
      console.log('Data:', JSON.stringify(response.data, null, 2));
      console.log('===================\n');
    }
    return response.data;
  },
  async (error) => {
    // Log errors in development
    if (__DEV__) {
      console.log('\n❌ === API ERROR ===');
      console.log('URL:', error.config?.url);
      console.log('Message:', error.message);
      console.log('Response Status:', error.response?.status);
      console.log('Response Data:', error.response?.data);
      console.log('Network Error:', error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK');
      console.log('===================\n');
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // You can navigate to login screen here if needed
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default api;
