// src/api/config.js
let API_URL;

if (__DEV__) {
  API_URL = 'http://localhost:8080/api';
} else {
  API_URL = 'https://your-production-api.com/api';
}

// API Endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
  },
  PLANTS: {
    BASE: '/plants',
    GET_ALL: '/plants',
    GET_BY_ID: (id) => `/plants/${id}`,
    CREATE: '/plants',
    UPDATE: (id) => `/plants/${id}`,
    DELETE: (id) => `/plants/${id}`,
  },
  DEVICES: {
    BASE: '/devices',
    GET_ALL: '/devices',
    GET_BY_ID: (id) => `/devices/${id}`,
    REGISTER: '/devices/register',
    UPDATE: (id) => `/devices/${id}`,
    DELETE: (id) => `/devices/${id}`,
  },
  USER: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
  },
};

// API request configurations
export const REQUEST_CONFIG = {
  TIMEOUT: 15000, // 15 seconds
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000, // 1 second
};

export default {
  API_URL,
  ENDPOINTS,
  REQUEST_CONFIG,
};