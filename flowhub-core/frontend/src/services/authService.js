/**
 * Auth Service
 * 
 * API calls for authentication operations.
 */

import api from './api';

/**
 * Login user
 * 
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {boolean} rememberMe - Whether to remember user
 * @returns {Promise<{token: string, user: object}>}
 */
export async function login(email, password, rememberMe = false) {
  const response = await api.post('/auth/login', {
    email: email.toLowerCase(),
    password,
    rememberMe
  });
  return response.data;
}

/**
 * Request signup OTP
 * 
 * @param {string} email - User email
 * @returns {Promise<{message: string, expiresIn: number, otp?: string}>}
 */
export async function signupRequestOTP(email) {
  const response = await api.post('/auth/signup/request-otp', {
    email: email.toLowerCase()
  });
  return response.data;
}

/**
 * Verify signup OTP
 * 
 * @param {string} email - User email
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<{message: string, verified: boolean}>}
 */
export async function signupVerifyOTP(email, otp) {
  const response = await api.post('/auth/signup/verify-otp', {
    email: email.toLowerCase(),
    otp
  });
  return response.data;
}

/**
 * Complete signup
 * 
 * @param {object} userData - User data (firstName, lastName, email, password)
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<{token: string, user: object}>}
 */
export async function signup(userData, otp) {
  const response = await api.post('/auth/signup', {
    ...userData,
    email: userData.email.toLowerCase(),
    otp
  });
  return response.data;
}

/**
 * Request password reset OTP
 * 
 * @param {string} email - User email
 * @returns {Promise<{message: string, expiresIn: number, otp?: string}>}
 */
export async function forgotPasswordRequestOTP(email) {
  const response = await api.post('/auth/forgot-password/request-otp', {
    email: email.toLowerCase()
  });
  return response.data;
}

/**
 * Verify password reset OTP
 * 
 * @param {string} email - User email
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<{message: string, verified: boolean}>}
 */
export async function forgotPasswordVerifyOTP(email, otp) {
  const response = await api.post('/auth/forgot-password/verify-otp', {
    email: email.toLowerCase(),
    otp
  });
  return response.data;
}

/**
 * Reset password
 * 
 * @param {string} email - User email
 * @param {string} otp - 6-digit OTP
 * @param {string} newPassword - New password
 * @returns {Promise<{message: string}>}
 */
export async function forgotPasswordReset(email, otp, newPassword) {
  const response = await api.post('/auth/forgot-password/reset', {
    email: email.toLowerCase(),
    otp,
    newPassword
  });
  return response.data;
}

/**
 * Logout user
 * 
 * @returns {Promise<{message: string}>}
 */
export async function logout() {
  const response = await api.post('/auth/logout');
  return response.data;
}

