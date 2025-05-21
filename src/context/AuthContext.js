import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// API URL - Change this to your backend URL
const API_URL = 'http://localhost:8080/api';

// Create Auth Context
const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: () => {},
  register: () => {},
  logout: () => {},
});

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        setIsAuthenticated(!!token);

        if (token) {
          const email = await AsyncStorage.getItem('userEmail');
          const role = await AsyncStorage.getItem('userRole');
          
          if (email && role) {
            setUser({ email, role });
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Register function
  const register = async (email, password, name, role = 'USER') => {
    try {
      const deviceToken = await AsyncStorage.getItem('deviceToken') || 'testtoken';
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        name,
        role,
        deviceToken,
      });
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle error message
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response) {
        if (error.response.status === 409) {
          errorMessage = 'Email already in use. Please use a different email.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      throw { ...error, message: errorMessage };
    }
  };

  // Login function
  login: async (email, password) => {
  console.log(`Attempting to login with email: ${email}`);
  
  try {
    const deviceToken = await AsyncStorage.getItem('deviceToken') || 'testtoken';
    
    console.log(`Making login request to: ${API_URL}/auth/login`);
    console.log(`Request payload:`, { email, password, deviceToken });
    
    // For React Native running on Android emulator, localhost refers to the emulator itself
    // If your backend is on your computer, use 10.0.2.2 instead of localhost
    const loginUrl = __DEV__ && Platform.OS === 'android' 
      ? 'http://localhost:8080/api/auth/login'
      : `${API_URL}/auth/login`;
    
    console.log(`Using URL: ${loginUrl}`);
    
    const response = await axios.post(loginUrl, {
      email,
      password,
      deviceToken,
    });
    
    console.log('Login response:', response.data);
    
    // Store the token and user info
    const { token, role } = response.data;
    
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('userEmail', email);
    await AsyncStorage.setItem('userRole', role);
    
    return response.data;
  } catch (error) {
    console.error('Login error details:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    // Handle error message
    let errorMessage = 'Login failed. Please check your credentials.';
    
    if (error.response) {
      if (error.response.status === 401) {
        errorMessage = 'Invalid email or password.';
      } else if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.request) {
      errorMessage = 'Network error. Please check your connection.';
    }
    
    throw { ...error, message: errorMessage };
  }
}

  // Logout function
  const logout = async () => {
    try {
      // Clear all auth related data
      await AsyncStorage.multiRemove(['authToken', 'userEmail', 'userRole']);
      
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the Auth Context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;