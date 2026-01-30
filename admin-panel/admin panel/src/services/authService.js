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

// Get current admin profile
export const getMe = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Update admin profile
export const updateAdminProfile = async (data) => {
  try {
    const response = await apiClient.put('/auth/admin/profile', data);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Change admin password
export const changeAdminPassword = async (currentPassword, newPassword) => {
  try {
    const response = await apiClient.put('/auth/admin/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Admin forgot password - Send OTP (mobile only)
export const sendAdminOtp = async (mobile) => {
  try {
    const response = await apiClient.post('/auth/admin/forgot-password/send-otp', { mobile });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Admin forgot password - Verify OTP (mobile only)
export const verifyAdminOtp = async (mobile, otp) => {
  try {
    const response = await apiClient.post('/auth/admin/forgot-password/verify-otp', { mobile, otp });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Admin forgot password - Reset Password (mobile only)
export const resetAdminPassword = async (mobile, otp, newPassword) => {
  try {
    const response = await apiClient.post('/auth/admin/forgot-password/reset', {
      mobile,
      otp,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default apiClient;