import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface RegisterData {
  name: string;
  email: string;
  mobile: string;
  password: string;
}

export interface LoginData {
  mobile?: string;
  email?: string;
  password: string;
}

export interface AdminLoginData {
  email: string;
  password: string;
}

class AuthService {
  // Register new user
  async register(data: RegisterData) {
   
    try {
      const response = await api.post('/auth/register', data);
    
      // response is the unwrapped backend response
      // response structure: { success, message, data: { user, token } }
      // so response.data = { user, token }
      if (response.data && response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Customer login
  async login(data: LoginData) {
    const response = await api.post('/auth/login', data);
    // response is the unwrapped backend response
    // response structure: { success, message, data: { user, token } }
    // so response.data = { user, token }
    if (response.data && response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      await AsyncStorage.setItem('userRole', 'customer');
    }
    return response;
  }

  // Admin login
  async adminLogin(data: AdminLoginData) {
    const response = await api.post('/auth/admin/login', data);
    // response is the unwrapped backend response
    // response structure: { success, message, data: { admin, token } }
    // so response.data = { admin, token }
    if (response.data && response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.admin));
      await AsyncStorage.setItem('userRole', 'admin');
    }
    return response;
  }

  // Get current user profile
  async getMe() {
    const response = await api.get('/auth/me');
    return response;
  }

  // Update profile
  async updateProfile(data: { name?: string; email?: string; mobile?: string; profilePicture?: string }) {
    const response = await api.put('/auth/profile', data);
    // response is the unwrapped backend response
    // response structure: { success, message, data: { user } }
    // so response.data = { user }
    if (response.data && response.data.user) {
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string) {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response;
  }

  // Upload profile picture
  async uploadProfilePicture(imageUri: string) {
    // Check if it's a URL or a local file path
    if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
      // If it's already a URL (e.g., Cloudinary URL), update profile directly
      return await this.updateProfile({ profilePicture: imageUri });
    }
    
    // Otherwise, upload as file to Cloudinary
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'profile.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    formData.append('profilePicture', {
      uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
      type: type,
      name: filename,
    } as any);

    const response = await api.post('/upload/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  }

  // Logout
  async logout() {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('userRole');
  }

  // Get stored token
  async getToken() {
    return await AsyncStorage.getItem('token');
  }

  // Get stored user
  async getUser() {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Get user role
  async getUserRole() {
    return await AsyncStorage.getItem('userRole');
  }

  // Forgot Password - Send OTP
  async sendOtp(mobile: string) {
    const response = await api.post('/auth/forgot-password/send-otp', { mobile });
    return response;
  }

  // Forgot Password - Verify OTP
  async verifyOtp(mobile: string, otp: string) {
    const response = await api.post('/auth/forgot-password/verify-otp', { mobile, otp });
    return response;
  }

  // Forgot Password - Reset Password
  async resetPassword(mobile: string, otp: string, newPassword: string) {
    const response = await api.post('/auth/forgot-password/reset', { mobile, otp, newPassword });
    return response;
  }
}

export default new AuthService();
