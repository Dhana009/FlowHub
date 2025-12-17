/**
 * File Service
 * 
 * Handles file uploads with two-phase commit pattern.
 * Phase 1: Upload to temporary location
 * Phase 2: Move to permanent location after item creation
 * Rollback: Clean up temp files on any failure
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Generate UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

class FileService {
  constructor() {
    // Ensure upload directories exist
    this.uploadDir = path.join(process.cwd(), 'uploads', 'items');
    this.tempDir = path.join(process.cwd(), 'uploads', 'items', 'temp');
    this._ensureDirectories();
  }

  /**
   * Ensure upload directories exist
   */
  async _ensureDirectories() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directories:', error);
    }
  }

  /**
   * Phase 1: Upload file to temporary location
   * 
   * @param {object} file - Multer file object
   * @param {string} userId - User ID uploading the file
   * @returns {Promise<object>} File info with temp path
   */
  async uploadToTemp(file, userId) {
    try {
      await this._ensureDirectories();

      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const tempFileName = `temp_${generateUUID()}${fileExtension}`;
      const tempFilePath = path.join(this.tempDir, tempFileName);

      // Write file to temp location
      await fs.writeFile(tempFilePath, file.buffer);

      return {
        tempFileName,
        tempFilePath,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        uploadedBy: userId
      };
    } catch (error) {
      throw new Error(`Failed to upload file to temporary location: ${error.message}`);
    }
  }

  /**
   * Phase 2: Commit file upload (move from temp to permanent)
   * 
   * @param {string} tempFilePath - Temporary file path
   * @param {string} itemId - Item ID to associate file with
   * @returns {Promise<string>} Permanent file path (relative to uploads/)
   */
  async commitFileUpload(tempFilePath, itemId) {
    try {
      if (!tempFilePath || !(await this._fileExists(tempFilePath))) {
        throw new Error('Temporary file does not exist');
      }

      // Generate permanent filename
      const fileExtension = path.extname(tempFilePath);
      const permanentFileName = `${itemId}_${generateUUID()}${fileExtension}`;
      const permanentPath = path.join(this.uploadDir, permanentFileName);

      // Move file from temp to permanent location
      await fs.rename(tempFilePath, permanentPath);

      // Return relative path for storage in database
      return `uploads/items/${permanentFileName}`;
    } catch (error) {
      throw new Error(`Failed to commit file upload: ${error.message}`);
    }
  }

  /**
   * Rollback file upload (delete temp file)
   * 
   * @param {string} tempFilePath - Temporary file path to delete
   * @returns {Promise<void>}
   */
  async rollbackFileUpload(tempFilePath) {
    try {
      if (tempFilePath && await this._fileExists(tempFilePath)) {
        await fs.unlink(tempFilePath);
      }
    } catch (error) {
      // Log but don't throw - cleanup should be best-effort
      console.error(`Error during file rollback for ${tempFilePath}:`, error.message);
    }
  }

  /**
   * Delete permanent file
   * 
   * @param {string} filePath - File path (relative or absolute)
   * @returns {Promise<void>}
   */
  async deleteFile(filePath) {
    try {
      if (!filePath) return;

      // Handle both relative and absolute paths
      const fullPath = filePath.startsWith('/') || filePath.startsWith('\\') 
        ? filePath 
        : path.join(process.cwd(), filePath);

      if (await this._fileExists(fullPath)) {
        await fs.unlink(fullPath);
      }
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error.message);
    }
  }

  /**
   * Check if file exists
   * 
   * @param {string} filePath - File path to check
   * @returns {Promise<boolean>}
   */
  async _fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
module.exports = new FileService();

