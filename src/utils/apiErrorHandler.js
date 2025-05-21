// src/utils/apiErrorHandler.js

/**
 * Handles API errors and returns a user-friendly error message
 * @param {Error} error - The error object from axios
 * @param {Object} options - Options for customizing error messages
 * @returns {string} A user-friendly error message
 */
export const handleApiError = (error, options = {}) => {
  const {
    defaultMessage = 'An error occurred. Please try again.',
    unauthorizedMessage = 'Unauthorized. Please log in again.',
    notFoundMessage = 'Resource not found.',
    serverErrorMessage = 'Server error. Please try again later.',
    networkErrorMessage = 'Network error. Please check your connection.',
    timeoutMessage = 'Request timed out. Please try again.',
  } = options;

  // Check if the error has a response (server responded with an error)
  if (error.response) {
    const { status, data } = error.response;

    // Get custom message from response if available
    const customMessage = data && data.message ? data.message : null;

    switch (status) {
      case 400:
        return customMessage || 'Bad request. Please check your input.';
      case 401:
        return customMessage || unauthorizedMessage;
      case 403:
        return customMessage || 'Access denied. You do not have permission to perform this action.';
      case 404:
        return customMessage || notFoundMessage;
      case 409:
        return customMessage || 'Conflict with current state. Resource may already exist.';
      case 422:
        return customMessage || 'Validation error. Please check your input.';
      case 429:
        return customMessage || 'Too many requests. Please try again later.';
      case 500:
      case 502:
      case 503:
      case 504:
        return customMessage || serverErrorMessage;
      default:
        return customMessage || defaultMessage;
    }
  }
  // The request was made but no response was received
  else if (error.request) {
    if (error.code === 'ECONNABORTED') {
      return timeoutMessage;
    }
    return networkErrorMessage;
  }
  // Something happened in setting up the request
  else {
    return error.message || defaultMessage;
  }
};

export default {
  handleApiError,
};