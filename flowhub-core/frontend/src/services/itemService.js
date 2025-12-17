/**
 * Item Service
 * 
 * Handles all item-related API calls.
 */

import api from './api';

/**
 * Create a new item
 * 
 * @param {object} itemData - Item data object
 * @param {File|null} file - Optional file to upload
 * @returns {Promise<object>} - Created item data
 * @throws {Error} - If creation fails (with statusCode and PRD error format)
 */
export async function createItem(itemData, file = null) {
  try {
    // Create FormData object
    const formData = new FormData();
    
    // Append all item fields directly (not as JSON string)
    // Core fields
    formData.append('name', itemData.name || '');
    formData.append('description', itemData.description || '');
    formData.append('item_type', itemData.item_type || '');
    formData.append('price', itemData.price || '');
    formData.append('category', itemData.category || '');
    
    // Tags (can be array or comma-separated string)
    if (itemData.tags) {
      if (Array.isArray(itemData.tags)) {
        itemData.tags.forEach(tag => {
          formData.append('tags', tag);
        });
      } else if (typeof itemData.tags === 'string') {
        formData.append('tags', itemData.tags);
      }
    }
    
    // Conditional fields based on item_type
    if (itemData.item_type === 'PHYSICAL') {
      if (itemData.weight) formData.append('weight', itemData.weight);
      if (itemData.dimensions) {
        if (itemData.dimensions.length) formData.append('length', itemData.dimensions.length);
        if (itemData.dimensions.width) formData.append('width', itemData.dimensions.width);
        if (itemData.dimensions.height) formData.append('height', itemData.dimensions.height);
      }
    } else if (itemData.item_type === 'DIGITAL') {
      if (itemData.download_url) formData.append('download_url', itemData.download_url);
      if (itemData.file_size) formData.append('file_size', itemData.file_size);
    } else if (itemData.item_type === 'SERVICE') {
      if (itemData.duration_hours) formData.append('duration_hours', itemData.duration_hours);
    }
    
    // Append file if provided
    if (file) {
      formData.append('file', file);
    }

    // Make API call
    const response = await api.post('/items', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    // Handle error responses - PRD format
    if (error.response) {
      const errorData = error.response.data;
      
      // PRD error format: { status, error_code, error_type, message, timestamp, path }
      const errorMessage = errorData?.message || errorData?.error || 'Failed to create item';
      
      // Create error with status code and PRD error data
      const customError = new Error(errorMessage);
      customError.statusCode = error.response.status;
      customError.error_code = errorData?.error_code;
      customError.error_type = errorData?.error_type;
      customError.details = errorData?.details;
      customError.data = errorData;
      throw customError;
    }
    
    // Network or other errors
    throw new Error(error.message || 'Network error. Please check your connection.');
  }
}

/**
 * Get all items with search, filter, sort, and pagination
 * Implements Flow 3 requirements
 * 
 * @param {object} params - Query parameters
 * @param {string} params.search - Search query
 * @param {string} params.status - Status filter (active/inactive)
 * @param {string} params.category - Category filter
 * @param {array|string} params.sort_by - Sort field(s)
 * @param {array|string} params.sort_order - Sort order(s)
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {boolean} params.silent - Silent mode for auto-refresh (don't throw on 401)
 * @returns {Promise<object>} - Items and pagination data
 */
export async function getItems(params = {}) {
  try {
    // Build query string
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.category) queryParams.append('category', params.category);
    
    // Handle sort_by (can be array or string)
    if (params.sort_by) {
      if (Array.isArray(params.sort_by)) {
        params.sort_by.forEach(field => queryParams.append('sort_by', field));
      } else {
        queryParams.append('sort_by', params.sort_by);
      }
    }
    
    // Handle sort_order (can be array or string)
    if (params.sort_order) {
      if (Array.isArray(params.sort_order)) {
        params.sort_order.forEach(order => queryParams.append('sort_order', order));
      } else {
        queryParams.append('sort_order', params.sort_order);
      }
    }
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    // Add auto-refresh header if silent mode
    const headers = {};
    if (params.silent) {
      headers['x-auto-refresh'] = 'true';
    }

    const queryString = queryParams.toString();
    const url = `/items${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url, { headers });
    return response.data;
  } catch (error) {
    // Handle silent errors for auto-refresh
    if (params.silent && error.response?.status === 401) {
      return { items: [], pagination: { page: 1, total_pages: 0, total: 0 } };
    }

    if (error.response) {
      const errorData = error.response.data;
      const errorMessage = errorData?.message || errorData?.error || 'Failed to fetch items';
      const customError = new Error(errorMessage);
      customError.statusCode = error.response.status;
      customError.data = errorData;
      throw customError;
    }
    throw new Error(error.message || 'Network error. Please check your connection.');
  }
}

/**
 * Get single item by ID (placeholder for Flow 4)
 * 
 * @param {string} itemId - Item ID
 * @returns {Promise<object>} - Item data
 */
export async function getItem(itemId) {
  try {
    const response = await api.get(`/items/${itemId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      const errorData = error.response.data;
      const errorMessage = errorData?.error || 'Failed to fetch item';
      const customError = new Error(errorMessage);
      customError.statusCode = error.response.status;
      throw customError;
    }
    throw new Error(error.message || 'Network error. Please check your connection.');
  }
}

