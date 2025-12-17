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
 * @throws {Error} - If creation fails
 */
export async function createItem(itemData, file = null) {
  try {
    // Create FormData object
    const formData = new FormData();
    
    // Append item_data as JSON string
    formData.append('item_data', JSON.stringify(itemData));
    
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
    // Handle error responses
    if (error.response) {
      const errorData = error.response.data;
      const errorMessage = errorData?.error || 'Failed to create item';
      
      // Create error with status code
      const customError = new Error(errorMessage);
      customError.statusCode = error.response.status;
      customError.data = errorData;
      throw customError;
    }
    
    // Network or other errors
    throw new Error(error.message || 'Network error. Please check your connection.');
  }
}

/**
 * Get all items (placeholder for Flow 3)
 * 
 * @returns {Promise<object>} - Items data
 */
export async function getItems() {
  try {
    const response = await api.get('/items');
    return response.data;
  } catch (error) {
    if (error.response) {
      const errorData = error.response.data;
      const errorMessage = errorData?.error || 'Failed to fetch items';
      const customError = new Error(errorMessage);
      customError.statusCode = error.response.status;
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

