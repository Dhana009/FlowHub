/**
 * Activity Service
 * 
 * API calls for retrieving audit logs.
 * Flow 9 - Activity Logs
 */

import api from './api';

/**
 * Get activity logs with pagination and filters
 * 
 * @param {object} params - { page, limit, action, resourceType }
 * @returns {Promise<object>}
 */
export async function getActivities(params = {}) {
  const response = await api.get('/activities', { params });
  return response.data;
}

