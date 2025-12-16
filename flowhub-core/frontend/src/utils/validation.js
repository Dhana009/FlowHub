/**
 * Validation Utility
 * 
 * Reusable validation functions for form fields.
 * All functions are pure (no side effects).
 * Returns empty string if valid, error message if invalid.
 */

/**
 * Validate email format
 * 
 * @param {string} value - Email to validate
 * @returns {string} - Error message or empty string if valid
 */
export function email(value) {
  if (!value) {
    return 'Email is required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return 'Please provide a valid email address';
  }

  return '';
}

/**
 * Validate password (required only)
 * 
 * @param {string} value - Password to validate
 * @returns {string} - Error message or empty string if valid
 */
export function password(value) {
  if (!value) {
    return 'Password is required';
  }

  return '';
}

/**
 * Validate password strength
 * 
 * Rules:
 * - Minimum 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one number (0-9)
 * - At least one special character (!@#$%^&*)
 * 
 * @param {string} value - Password to validate
 * @returns {string} - Error message or empty string if valid
 */
export function passwordStrength(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 8) {
    return 'Password must be at least 8 characters long';
  }

  if (!/[A-Z]/.test(value)) {
    return 'Password must contain at least one uppercase letter';
  }

  if (!/[a-z]/.test(value)) {
    return 'Password must contain at least one lowercase letter';
  }

  if (!/[0-9]/.test(value)) {
    return 'Password must contain at least one number';
  }

  if (!/[!@#$%^&*]/.test(value)) {
    return 'Password must contain at least one special character (!@#$%^&*)';
  }

  return '';
}

/**
 * Validate first name
 * 
 * @param {string} value - First name to validate
 * @returns {string} - Error message or empty string if valid
 */
export function firstName(value) {
  if (!value) {
    return 'First name is required';
  }

  if (value.length < 2) {
    return 'First name must be at least 2 characters long';
  }

  if (value.length > 50) {
    return 'First name must not exceed 50 characters';
  }

  const nameRegex = /^[a-zA-Z\s]+$/;
  if (!nameRegex.test(value)) {
    return 'First name can only contain letters and spaces';
  }

  return '';
}

/**
 * Validate last name
 * 
 * @param {string} value - Last name to validate
 * @returns {string} - Error message or empty string if valid
 */
export function lastName(value) {
  if (!value) {
    return 'Last name is required';
  }

  if (value.length < 2) {
    return 'Last name must be at least 2 characters long';
  }

  if (value.length > 50) {
    return 'Last name must not exceed 50 characters';
  }

  const nameRegex = /^[a-zA-Z\s]+$/;
  if (!nameRegex.test(value)) {
    return 'Last name can only contain letters and spaces';
  }

  return '';
}

/**
 * Validate confirm password
 * 
 * @param {string} value - Confirm password value
 * @param {string} password - Original password to match
 * @returns {string} - Error message or empty string if valid
 */
export function confirmPassword(value, password) {
  if (!value) {
    return 'Please confirm your password';
  }

  if (value !== password) {
    return 'Passwords do not match';
  }

  return '';
}

/**
 * Validate OTP (6 digits)
 * 
 * @param {string} value - OTP to validate
 * @returns {string} - Error message or empty string if valid
 */
export function otp(value) {
  if (!value) {
    return 'OTP is required';
  }

  const otpRegex = /^[0-9]{6}$/;
  if (!otpRegex.test(value)) {
    return 'OTP must be exactly 6 digits';
  }

  return '';
}

