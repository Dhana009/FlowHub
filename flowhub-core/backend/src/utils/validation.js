/**
 * Validation Utility
 * 
 * Reusable validation functions for form fields.
 * All functions are pure (no side effects).
 */

/**
 * Validate email format
 * 
 * @param {string} email - Email to validate
 * @returns {string|null} - Error message if invalid, null if valid
 */
function validateEmail(email) {
  if (!email) {
    return 'Email is required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please provide a valid email address';
  }

  return null;
}

/**
 * Validate name (first name or last name)
 * 
 * @param {string} name - Name to validate
 * @param {string} fieldName - Field name for error message (e.g., "First name")
 * @returns {string|null} - Error message if invalid, null if valid
 */
function validateName(name, fieldName = 'Name') {
  if (!name) {
    return `${fieldName} is required`;
  }

  if (name.length < 2) {
    return `${fieldName} must be at least 2 characters long`;
  }

  if (name.length > 50) {
    return `${fieldName} must not exceed 50 characters`;
  }

  const nameRegex = /^[a-zA-Z\s]+$/;
  if (!nameRegex.test(name)) {
    return `${fieldName} can only contain letters and spaces`;
  }

  return null;
}

/**
 * Validate OTP format (6 digits)
 * 
 * @param {string} otp - OTP to validate
 * @returns {string|null} - Error message if invalid, null if valid
 */
function validateOTP(otp) {
  if (!otp) {
    return 'OTP is required';
  }

  const otpRegex = /^[0-9]{6}$/;
  if (!otpRegex.test(otp)) {
    return 'OTP must be exactly 6 digits';
  }

  return null;
}

module.exports = {
  validateEmail,
  validateName,
  validateOTP
};

