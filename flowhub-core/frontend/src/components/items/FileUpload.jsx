/**
 * File Upload Component
 * 
 * Handles file selection, validation, and display.
 */

import { useRef } from 'react';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MIN_FILE_SIZE = 1024; // 1 KB
const ALLOWED_TYPES = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'];

/**
 * Format file size for display
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Validate file
 */
function validateFile(file) {
  if (!file) {
    return '';
  }

  // Check file extension
  const fileName = file.name.toLowerCase();
  const fileExt = fileName.substring(fileName.lastIndexOf('.'));
  
  if (!ALLOWED_TYPES.includes(fileExt)) {
    return `File type ${fileExt} not supported. Allowed: ${ALLOWED_TYPES.join(', ')}`;
  }

  // Check file size
  if (file.size < MIN_FILE_SIZE) {
    return `File too small. Min size: ${formatFileSize(MIN_FILE_SIZE)}`;
  }

  if (file.size > MAX_FILE_SIZE) {
    return `File too large. Max size: ${formatFileSize(MAX_FILE_SIZE)}`;
  }

  return '';
}

/**
 * File Upload Component
 * 
 * @param {object} props
 * @param {File|null} props.selectedFile - Currently selected file
 * @param {function} props.onFileSelect - File selection handler
 * @param {function} props.onFileRemove - File removal handler
 * @param {string} props.error - File validation error
 */
export default function FileUpload({
  selectedFile,
  onFileSelect,
  onFileRemove,
  error
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      onFileSelect(null, validationError);
      return;
    }

    // File is valid
    onFileSelect(file, '');
  };

  const handleRemove = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileRemove();
  };

  return (
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload File (Optional)
      </label>

      {!selectedFile ? (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={ALLOWED_TYPES.join(',')}
            data-testid="item-file-upload"
            aria-label="Upload File"
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              cursor-pointer"
          />
          <p className="mt-1 text-xs text-gray-500">
            Allowed: {ALLOWED_TYPES.join(', ')} (Max: {formatFileSize(MAX_FILE_SIZE)})
          </p>
        </div>
      ) : (
        <div 
          data-testid="selected-file"
          className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
        >
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
            <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
          </div>
          <Button
            type="button"
            onClick={handleRemove}
            dataTestid="remove-file"
            className="ml-4"
          >
            Remove
          </Button>
        </div>
      )}

      {(error || (selectedFile && validateFile(selectedFile))) && (
        <ErrorMessage
          message={error || validateFile(selectedFile)}
          dataTestid="file-error"
          ariaLive="polite"
        />
      )}
    </div>
  );
}

