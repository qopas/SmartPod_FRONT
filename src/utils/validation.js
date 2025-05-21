// src/utils/validation.js

/**
 * Validates an email address
 * @param {string} email - The email to validate
 * @returns {boolean} True if the email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a password
 * @param {string} password - The password to validate
 * @param {Object} options - Options for password validation
 * @returns {Object} Validation result with isValid and message
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = false,
    requireLowercase = false,
    requireNumber = false,
    requireSpecialChar = false,
  } = options;

  let result = { isValid: true, message: '' };

  if (!password || password.length < minLength) {
    result.isValid = false;
    result.message = `Password must be at least ${minLength} characters long`;
    return result;
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    result.isValid = false;
    result.message = 'Password must contain at least one uppercase letter';
    return result;
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    result.isValid = false;
    result.message = 'Password must contain at least one lowercase letter';
    return result;
  }

  if (requireNumber && !/\d/.test(password)) {
    result.isValid = false;
    result.message = 'Password must contain at least one number';
    return result;
  }

  if (requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    result.isValid = false;
    result.message = 'Password must contain at least one special character';
    return result;
  }

  return result;
};

/**
 * Validates that two passwords match
 * @param {string} password - The password
 * @param {string} confirmPassword - The confirmation password
 * @returns {boolean} True if the passwords match
 */
export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

/**
 * Validates if a string is not empty
 * @param {string} value - The string to validate
 * @returns {boolean} True if the string is not empty
 */
export const isNotEmpty = (value) => {
  return value !== undefined && value !== null && value.trim() !== '';
};

export default {
  isValidEmail,
  validatePassword,
  passwordsMatch,
  isNotEmpty,
};