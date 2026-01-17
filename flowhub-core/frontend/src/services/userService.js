/**
 * User Service
 * 
 * API calls for Admin user management.
 * Flow 10 - User Management
 */

import api from './api';

/**
 * Get all users
 */
export async function getUsers(params = {}) {
  const response = await api.get('/users', { params });
  return response.data;
}

/**
 * Update user role
 */
export async function updateUserRole(userId, role) {
  const response = await api.patch(`/users/${userId}/role`, { role });
  return response.data;
}

/**
 * Update user status (activate/deactivate)
 */
export async function updateUserStatus(userId, isActive) {
  const response = await api.patch(`/users/${userId}/status`, { isActive });
  return response.data;
}

/**
 * Deactivate user (legacy)
 */
export async function deactivateUser(userId) {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
}

