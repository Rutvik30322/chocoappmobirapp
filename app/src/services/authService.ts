import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    console.log('📝 AuthService: Starting registration with data:', data);
    try {
      const response = await api.post('/auth/register', data);
      console.log('✅ AuthService: Registration API response:', response);
      // response is the unwrapped backend response
      // response structure: { success, message, data: { user, token } }
      // so response.data = { user, token }
      if (response.data && response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('✅ AuthService: Token and user saved to storage');
      }
      return response;
    } catch (error) {
      console.log('❌ AuthService: Registration error:', error);
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
  async updateProfile(data: { name?: string; email?: string; mobile?: string }) {
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
    const formData = new FormData();
    formData.append('profilePicture', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
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
}

export default new AuthService();
