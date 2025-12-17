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
    
    // Append optional embed_url if provided
    if (itemData.embed_url) {
      formData.append('embed_url', itemData.embed_url);
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
 * Delete an item (soft delete) (Flow 6)
 * DELETE /api/v1/items/:id
 * 
 * PRD Reference: Flow 6 - Item Delete (Section 8)
 * 
 * @param {string} itemId - Item ID to delete
 * @param {AbortSignal} signal - Optional abort signal for request cancellation
 * @returns {Promise<object>} - Deleted item data
 * @throws {Error} - If deletion fails (with statusCode and PRD error format)
 */
export async function deleteItem(itemId, signal = null) {
  // PRD Section 17.2: API Request Timeout (10 seconds)
  const TIMEOUT_MS = 10000;

  try {
    const response = await api.delete(`/items/${itemId}`, {
      signal: signal,
      timeout: TIMEOUT_MS
    });

    // PRD Section 8: Success Response (200 OK)
    return response.data.data; // Return item data from response
  } catch (error) {
    // Handle abort
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED' || error.isCancelled) {
      const cancelError = new Error('Request cancelled');
      cancelError.isCancelled = true;
      throw cancelError;
    }

    // Handle timeout
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      const timeoutError = new Error('Request timed out. Please try again.');
      timeoutError.statusCode = 408;
      timeoutError.error_code = 408;
      timeoutError.error_type = 'Request Timeout';
      throw timeoutError;
    }

    // PRD Section 8: Handle error responses - PRD format
    if (error.response) {
      const errorData = error.response.data;
      
      // PRD error format: { status, error_code, error_type, message, timestamp, path, error_code_detail }
      const customError = new Error(errorData?.message || 'Failed to delete item');
      customError.statusCode = error.response.status;
      customError.error_code = errorData?.error_code || error.response.status;
      customError.error_type = errorData?.error_type || 'Error';
      customError.error_code_detail = errorData?.error_code_detail;
      customError.details = errorData?.details;
      customError.data = errorData;
      throw customError;
    }

    // Handle network errors (PRD Section 11.1: Network Error)
    if (!error.statusCode) {
      const networkError = new Error('Connection failed. Please check your internet and try again.');
      networkError.statusCode = 0;
      networkError.error_code = 0;
      networkError.error_type = 'Network Error';
      throw networkError;
    }
    
    // Re-throw if already has statusCode
    throw error;
  }
}

/**
 * Activate (restore) a deleted item (Flow 6 extension)
 * PATCH /api/v1/items/:id/activate
 * 
 * @param {string} itemId - Item ID to activate
 * @param {AbortSignal} signal - Optional abort signal for request cancellation
 * @returns {Promise<object>} - Activated item data
 * @throws {Error} - If activation fails (with statusCode and PRD error format)
 */
export async function activateItem(itemId, signal = null) {
  // API Request Timeout (10 seconds)
  const TIMEOUT_MS = 10000;

  try {
    const response = await api.patch(`/items/${itemId}/activate`, {}, {
      signal: signal,
      timeout: TIMEOUT_MS
    });

    // Success Response (200 OK)
    return response.data.data; // Return item data from response
  } catch (error) {
    // Handle abort
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED' || error.isCancelled) {
      const cancelError = new Error('Request cancelled');
      cancelError.isCancelled = true;
      throw cancelError;
    }

    // Handle timeout
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      const timeoutError = new Error('Request timed out. Please try again.');
      timeoutError.statusCode = 408;
      timeoutError.error_code = 408;
      timeoutError.error_type = 'Request Timeout';
      throw timeoutError;
    }

    // Handle error responses - PRD format
    if (error.response) {
      const errorData = error.response.data;
      
      // PRD error format: { status, error_code, error_type, message, timestamp, path, error_code_detail }
      const customError = new Error(errorData?.message || 'Failed to activate item');
      customError.statusCode = error.response.status;
      customError.error_code = errorData?.error_code || error.response.status;
      customError.error_type = errorData?.error_type || 'Error';
      customError.error_code_detail = errorData?.error_code_detail;
      customError.details = errorData?.details;
      customError.data = errorData;
      throw customError;
    }

    // Handle network errors
    if (!error.statusCode) {
      const networkError = new Error('Connection failed. Please check your internet and try again.');
      networkError.statusCode = 0;
      networkError.error_code = 0;
      networkError.error_type = 'Network Error';
      throw networkError;
    }
    
    // Re-throw if already has statusCode
    throw error;
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
 * Get single item by ID (Flow 4)
 * PRD Reference: Flow 4 - Item Details (Section 9)
 * 
 * Handles timeout (10 seconds), network errors, and all PRD error formats.
 * 
 * @param {string} itemId - Item ID (MongoDB ObjectId)
 * @param {AbortSignal} [signal] - Optional AbortSignal for request cancellation
 * @returns {Promise<object>} - Item data from response.data
 * @throws {Error} - With statusCode, error_code, error_type, and message matching PRD format
 */
export async function getItem(itemId, signal = null) {
  // PRD Section 9: Request timeout is 10 seconds (handled by axios timeout)
  const TIMEOUT_MS = 10000;

  try {
    const response = await api.get(`/items/${itemId}`, {
      timeout: TIMEOUT_MS,
      signal: signal // Allow request cancellation
    });

    // PRD Section 9: Success response format
    // { status: 'success', message: 'Item retrieved successfully', data: { item } }
    return response.data.data; // Return the item data directly
  } catch (error) {
    // Handle request cancellation (user closed modal)
    if (error.name === 'AbortError' || error.name === 'CanceledError') {
      const cancelError = new Error('Request cancelled');
      cancelError.statusCode = 0;
      cancelError.isCancelled = true;
      throw cancelError;
    }

    // Handle timeout (PRD Section 8.1: Request Timeout)
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      const timeoutError = new Error('Request timed out. Please try again.');
      timeoutError.statusCode = 408;
      timeoutError.error_code = 408;
      timeoutError.error_type = 'Request Timeout';
      throw timeoutError;
    }

    // Handle HTTP error responses (PRD Section 9: Error Responses)
    if (error.response) {
      const errorData = error.response.data;
      
      // PRD error format: { status, error_code, error_type, message, timestamp, path }
      const errorMessage = errorData?.message || errorData?.error || 'Failed to fetch item';
      
      const customError = new Error(errorMessage);
      customError.statusCode = error.response.status;
      customError.error_code = errorData?.error_code || error.response.status;
      customError.error_type = errorData?.error_type || 'Error';
      customError.data = errorData; // Full PRD error object
      
      throw customError;
    }

    // Handle network errors (PRD Section 8.1: Network Error)
    if (error.request && !error.response) {
      const networkError = new Error('Connection failed. Please check your internet and try again.');
      networkError.statusCode = 0;
      networkError.error_code = 0;
      networkError.error_type = 'Network Error';
      networkError.isNetworkError = true;
      throw networkError;
    }

    // Fallback for unknown errors
    throw new Error(error.message || 'An unexpected error occurred while retrieving the item.');
  }
}

/**
 * Update an existing item (Flow 5)
 * PRD Reference: Flow 5 - Item Edit
 * 
 * @param {string} itemId - Item ID to update
 * @param {object} itemData - Updated item data
 * @param {File|null} file - Optional file to upload (replaces existing file)
 * @param {number} version - Current version number (required for optimistic locking)
 * @returns {Promise<object>} - Updated item data
 * @throws {Error} - If update fails (with statusCode and PRD error format)
 */
export async function updateItem(itemId, itemData, file = null, version) {
  try {
    // Create FormData object
    const formData = new FormData();
    
    // Append version (required for optimistic locking)
    // Robust version sanitization to handle all edge cases
    if (version === undefined || version === null) {
      throw new Error('Version field is required for item updates');
    }
    
    // Use parseInt with base 10 to avoid floating point and scientific notation issues
    const versionNum = parseInt(version, 10);
    
    // Validate: must be a finite integer, positive, and not NaN
    if (!Number.isFinite(versionNum) || isNaN(versionNum) || versionNum <= 0 || !Number.isInteger(versionNum)) {
      console.error('Version validation failed:', {
        original: version,
        type: typeof version,
        parsed: versionNum,
        isFinite: Number.isFinite(versionNum),
        isNaN: isNaN(versionNum),
        isInteger: Number.isInteger(versionNum),
        isPositive: versionNum > 0
      });
      throw new Error(`Version field is required and must be a positive integer. Received: ${version} (parsed as ${versionNum})`);
    }
    
    // Ensure clean integer string (no decimals, no scientific notation)
    const cleanVersion = Math.floor(Math.abs(versionNum)).toString();
    formData.append('version', cleanVersion);
    
    // Debug logging
    console.log('Version validation passed:', {
      original: version,
      parsed: versionNum,
      final: cleanVersion
    });
    
    // Append all item fields that are provided
    if (itemData.name !== undefined) formData.append('name', itemData.name || '');
    if (itemData.description !== undefined) formData.append('description', itemData.description || '');
    if (itemData.item_type !== undefined) formData.append('item_type', itemData.item_type || '');
    if (itemData.price !== undefined) formData.append('price', itemData.price || '');
    if (itemData.category !== undefined) formData.append('category', itemData.category || '');
    
    // Tags (can be array or comma-separated string, or empty array)
    if (itemData.tags !== undefined) {
      if (Array.isArray(itemData.tags)) {
        // Empty array means clear all tags
        itemData.tags.forEach(tag => {
          formData.append('tags', tag);
        });
      } else if (typeof itemData.tags === 'string') {
        formData.append('tags', itemData.tags);
      }
    }
    
    // Conditional fields based on item_type
    if (itemData.item_type === 'PHYSICAL' || itemData.weight !== undefined) {
      if (itemData.weight !== undefined) formData.append('weight', itemData.weight);
      if (itemData.dimensions) {
        if (itemData.dimensions.length !== undefined) formData.append('length', itemData.dimensions.length);
        if (itemData.dimensions.width !== undefined) formData.append('width', itemData.dimensions.width);
        if (itemData.dimensions.height !== undefined) formData.append('height', itemData.dimensions.height);
      }
    } else if (itemData.item_type === 'DIGITAL' || itemData.download_url !== undefined) {
      if (itemData.download_url !== undefined) formData.append('download_url', itemData.download_url);
      if (itemData.file_size !== undefined) formData.append('file_size', itemData.file_size);
    } else if (itemData.item_type === 'SERVICE' || itemData.duration_hours !== undefined) {
      if (itemData.duration_hours !== undefined) formData.append('duration_hours', itemData.duration_hours);
    }
    
    // Append optional embed_url if provided
    if (itemData.embed_url !== undefined) {
      formData.append('embed_url', itemData.embed_url || '');
    }
    
    // Append file if provided (replaces existing file)
    if (file) {
      formData.append('file', file);
    }

    // Debug: Log all FormData entries before sending
    console.log('=== FormData being sent to API ===');
    for (let [key, value] of formData.entries()) {
      if (key === 'file') {
        console.log(`${key}: [File] ${value.name || 'unknown'} (${value.size} bytes)`);
      } else {
        console.log(`${key}:`, value, `(type: ${typeof value})`);
      }
    }
    console.log('=== End FormData ===');

    // Make API call (PUT request)
    const response = await api.put(`/items/${itemId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    // Enhanced error logging for debugging
    console.error('=== Update Item Error ===');
    console.error('Error object:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    }
    if (error.request) {
      console.error('Request config:', error.config);
    }
    console.error('=== End Error Details ===');
    
    // Handle error responses - PRD format
    if (error.response) {
      const errorData = error.response.data;
      
      // PRD error format: { status, error_code, error_type, message, timestamp, path }
      const errorMessage = errorData?.message || errorData?.error || 'Failed to update item';
      
      // Create error with status code and PRD error data
      const customError = new Error(errorMessage);
      customError.statusCode = error.response.status;
      customError.error_code = errorData?.error_code;
      customError.error_type = errorData?.error_type;
      customError.error_code_detail = errorData?.error_code_detail;
      customError.current_version = errorData?.current_version;
      customError.provided_version = errorData?.provided_version;
      customError.details = errorData?.details;
      customError.data = errorData;
      throw customError;
    }
    
    // Network or other errors
    throw new Error(error.message || 'Network error. Please check your connection.');
  }
}

