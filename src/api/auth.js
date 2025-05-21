// src/api/auth.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleApiError } from '../utils/apiErrorHandler';
import { API_URL, ENDPOINTS, REQUEST_CONFIG } from './config';

// Configure axios defaults
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: REQUEST_CONFIG.TIMEOUT,
});

// Add interceptor to add auth token to requests
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const authService = {
  // Register a new user
  register: async (email, password, name, role = 'USER') => {
    try {
      const deviceToken = await AsyncStorage.getItem('deviceToken') || 'testtoken';
      const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, {
        email,
        password,
        name,
        role,
        deviceToken,
      });
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = handleApiError(error, {
        defaultMessage: 'Registration failed. Please try again.',
        unauthorizedMessage: 'Cannot register. Please check your credentials.',
      });
      throw { ...error, message: errorMessage };
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const deviceToken = await AsyncStorage.getItem('deviceToken') || 'testtoken';
      const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
        deviceToken,
      });
      
      // Store the token in AsyncStorage
      const { token, role } = response.data;
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('userRole', role);
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = handleApiError(error, {
        defaultMessage: 'Login failed. Please try again.',
        unauthorizedMessage: 'Invalid email or password.',
      });
      throw { ...error, message: errorMessage };
    }
  },

  // Logout user
  logout: async () => {
    try {
      // Clear all auth related data from AsyncStorage
      await AsyncStorage.multiRemove(['authToken', 'userEmail', 'userRole']);
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return !!token;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  },

  // Get current user info
  getCurrentUser: async () => {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      const role = await AsyncStorage.getItem('userRole');
      
      if (!email) return null;
      
      return {
        email,
        role,
      };
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  },
};

export default authService;