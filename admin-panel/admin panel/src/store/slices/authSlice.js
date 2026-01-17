import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginAdmin } from '../../services/authService';

// Define initial state
const initialState = {
  user: null,
  token: localStorage.getItem('adminToken'),
  isLoading: false,
  isAuthenticated: localStorage.getItem('adminToken') ? true : false,
  error: null,
  success: null,
};

// Async thunk for admin login
export const adminLogin = createAsyncThunk(
  'auth/adminLogin',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginAdmin(credentials);
      // Save token to localStorage
      localStorage.setItem('adminToken', response.token);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for admin logout
export const adminLogout = createAsyncThunk(
  'auth/adminLogout',
  async (_, { dispatch }) => {
    // Remove token from localStorage
    localStorage.removeItem('adminToken');
    return null;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    resetAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Admin Login
      .addCase(adminLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.admin || action.payload.user; // Handle both admin and user responses
        state.token = action.payload.token;
        state.success = 'Login successful!';
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = null;
      })
      // Admin Logout
      .addCase(adminLogout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.success = 'Logged out successfully!';
      });
  },
});

export const { clearError, clearSuccess, resetAuth } = authSlice.actions;
export default authSlice.reducer;