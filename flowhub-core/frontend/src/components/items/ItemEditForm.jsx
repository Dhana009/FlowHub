/**
 * Item Edit Form Component
 * 
 * Form component for editing existing items with pre-populated data.
 * Flow 5 - Item Edit
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import useForm from '../../hooks/useForm';
import {
  itemName,
  itemDescription,
  itemType,
  itemPrice,
  itemCategory,
  itemTags,
  itemWeight,
  itemDimension,
  itemDownloadUrl,
  itemFileSize,
  itemDurationHours
} from '../../utils/validation';
import { updateItem } from '../../services/itemService';
import Input from '../common/Input';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';
import ConditionalFields from './ConditionalFields';
import FileUpload from './FileUpload';

/**
 * Item Edit Form
 * 
 * @param {object} item - Item data to edit
 */
export default function ItemEditForm({ item }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [currentVersion, setCurrentVersion] = useState(() => {
    const version = item?.version;
    // Ensure version is a positive integer
    if (version != null && version !== undefined) {
      const num = Number(version);
      if (!isNaN(num) && num > 0 && Number.isInteger(num)) {
        return num;
      }
    }
    return 1;
  });

  // Initialize form values from existing item
  const getInitialValues = () => {
    if (!item) {
      return {
        name: '',
        description: '',
        item_type: '',
        price: '',
        category: '',
        tags: '',
        weight: '',
        dimensions: { length: '', width: '', height: '' },
        download_url: '',
        file_size: '',
        duration_hours: '',
        embed_url: ''
      };
    }

    return {
      name: item.name || '',
      description: item.description || '',
      item_type: item.item_type || '',
      price: item.price?.toString() || '',
      category: item.category || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
      // Conditional fields
      weight: item.weight?.toString() || '',
      dimensions: {
        length: item.dimensions?.length?.toString() || '',
        width: item.dimensions?.width?.toString() || '',
        height: item.dimensions?.height?.toString() || ''
      },
      download_url: item.download_url || '',
      file_size: item.file_size?.toString() || '',
      duration_hours: item.duration_hours?.toString() || '',
      // Optional fields
      embed_url: item.embed_url || ''
    };
  };

  // Base validation rules (always applied)
  const baseValidationRules = {
    name: itemName,
    description: itemDescription,
    item_type: itemType,
    price: itemPrice,
    category: itemCategory,
    tags: itemTags
  };

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    setFormValues,
    setErrors,
    setTouched
  } = useForm(getInitialValues(), baseValidationRules);

  // Update form values when item loads
  useEffect(() => {
    if (item) {
      const initialValues = getInitialValues();
      setFormValues(initialValues);
      // Ensure version is a positive integer
      const version = item?.version;
      if (version != null && version !== undefined) {
        const num = Number(version);
        if (!isNaN(num) && num > 0 && Number.isInteger(num)) {
          setCurrentVersion(num);
        } else {
          setCurrentVersion(1);
        }
      } else {
        setCurrentVersion(1);
      }
    }
  }, [item]);

  // Clear conditional fields when item_type changes
  useEffect(() => {
    if (!values.item_type) {
      return;
    }
    
    // Only clear if item_type actually changed from original
    if (item && item.item_type === values.item_type) {
      return; // Don't clear if it's the same type
    }
    
    // Clear conditional fields when type changes
    const clearedValues = {
      weight: '',
      dimensions: { length: '', width: '', height: '' },
      download_url: '',
      file_size: '',
      duration_hours: ''
    };
    setFormValues(clearedValues);
    
    // Clear related errors
    setErrors((prevErrors) => {
      const clearedErrors = { ...prevErrors };
      delete clearedErrors.weight;
      delete clearedErrors['dimensions.length'];
      delete clearedErrors['dimensions.width'];
      delete clearedErrors['dimensions.height'];
      delete clearedErrors.download_url;
      delete clearedErrors.file_size;
      delete clearedErrors.duration_hours;
      return clearedErrors;
    });
    
    // Clear related touched states
    setTouched((prevTouched) => {
      const clearedTouched = { ...prevTouched };
      delete clearedTouched.weight;
      delete clearedTouched['dimensions.length'];
      delete clearedTouched['dimensions.width'];
      delete clearedTouched['dimensions.height'];
      delete clearedTouched.download_url;
      delete clearedTouched.file_size;
      delete clearedTouched.duration_hours;
      return clearedTouched;
    });
  }, [values.item_type, item, setFormValues, setErrors, setTouched]);

  // Handle file selection
  const handleFileSelect = (file, error) => {
    setSelectedFile(file);
    setFileError(error || '');
  };

  // Handle file removal
  const handleFileRemove = () => {
    setSelectedFile(null);
    setFileError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Validate all fields
    if (!validateAll()) {
      return;
    }

    // Validate file if provided
    if (selectedFile && fileError) {
      return;
    }

    // Validate conditional fields based on item_type
    if (values.item_type === 'PHYSICAL') {
      if (!values.weight || !values.dimensions?.length || !values.dimensions?.width || !values.dimensions?.height) {
        setSubmitError('Please fill in all required fields for physical items');
        return;
      }
    } else if (values.item_type === 'DIGITAL') {
      if (!values.download_url || !values.file_size) {
        setSubmitError('Please fill in all required fields for digital items');
        return;
      }
    } else if (values.item_type === 'SERVICE') {
      if (!values.duration_hours) {
        setSubmitError('Please fill in all required fields for service items');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Prepare item data (only include fields that are provided)
      const itemData = {
        name: values.name.trim(),
        description: values.description.trim(),
        item_type: values.item_type.toUpperCase(),
        price: parseFloat(values.price),
        category: values.category.trim(),
        tags: values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };

      // Add conditional fields
      if (values.item_type === 'PHYSICAL') {
        itemData.weight = parseFloat(values.weight);
        itemData.dimensions = {
          length: parseFloat(values.dimensions.length),
          width: parseFloat(values.dimensions.width),
          height: parseFloat(values.dimensions.height)
        };
      } else if (values.item_type === 'DIGITAL') {
        itemData.download_url = values.download_url.trim();
        itemData.file_size = parseInt(values.file_size, 10);
      } else if (values.item_type === 'SERVICE') {
        itemData.duration_hours = parseInt(values.duration_hours, 10);
      }

      // Add optional embed_url if provided
      if (values.embed_url && values.embed_url.trim()) {
        itemData.embed_url = values.embed_url.trim();
      }

      // Ensure version is a valid positive integer before sending
      // Use parseInt to ensure clean integer conversion
      let versionToSend = 1;
      if (currentVersion != null && currentVersion !== undefined) {
        const parsed = parseInt(currentVersion, 10);
        if (!isNaN(parsed) && Number.isFinite(parsed) && parsed > 0 && Number.isInteger(parsed)) {
          versionToSend = parsed;
        }
      }
      
      // Debug logging
      console.log('Sending version to API:', {
        currentVersion,
        versionToSend,
        type: typeof versionToSend
      });
      
      // Update item with version for optimistic locking
      const result = await updateItem(item._id, itemData, selectedFile, versionToSend);
      
      // Check if response matches PRD success format
      if (result.status === 'success' && result.data) {
        // Success - show toast and redirect to items list
        showToast('Item updated', 'success');
        navigate('/items', { 
          replace: true,
          state: { message: 'Item updated' }
        });
      }
    } catch (error) {
      // Handle error - PRD format
      let errorMessage = 'Failed to update item. Please try again.';
      let fieldErrors = {};

      if (error.statusCode === 401) {
        errorMessage = 'Authentication required. Please log in.';
        navigate('/login', { replace: true });
        return;
      } else if (error.statusCode === 409) {
        // Version conflict or item state conflict
        if (error.error_code_detail === 'VERSION_CONFLICT') {
          errorMessage = `Item was modified by another user. Current version: ${error.current_version}, Your version: ${error.provided_version}. Please refresh and try again.`;
          // Reload item to get latest version
          window.location.reload();
        } else if (error.error_code_detail === 'ITEM_DELETED') {
          errorMessage = 'Cannot edit deleted item.';
        } else if (error.error_code_detail === 'ITEM_INACTIVE') {
          errorMessage = 'Cannot edit inactive item.';
        } else {
          errorMessage = error.message || 'Conflict occurred. Please try again.';
        }
      } else if (error.statusCode === 404) {
        errorMessage = 'Item not found or you do not have permission to edit it.';
      } else if (error.statusCode === 413) {
        errorMessage = 'File too large. Max size: 5MB';
        setFileError(errorMessage);
      } else if (error.statusCode === 415) {
        errorMessage = 'File type not supported. Allowed types: .jpg, .jpeg, .png, .pdf, .doc, .docx';
        setFileError(errorMessage);
      } else if (error.statusCode === 422) {
        // Schema validation errors
        errorMessage = error.message || 'Validation failed. Please check your input.';
        if (error.details && Array.isArray(error.details)) {
          error.details.forEach(detail => {
            if (detail.field) {
              fieldErrors[detail.field] = detail.message;
            }
          });
          setErrors(prev => ({ ...prev, ...fieldErrors }));
        }
      } else if (error.statusCode === 400) {
        // Business rule validation errors
        errorMessage = error.message || 'Business rule validation failed. Please check your input.';
        if (error.details && Array.isArray(error.details)) {
          error.details.forEach(detail => {
            if (detail.field) {
              fieldErrors[detail.field] = detail.message;
            }
          });
          setErrors(prev => ({ ...prev, ...fieldErrors }));
        }
      } else if (error.statusCode === 500) {
        errorMessage = 'Something went wrong. Please try again.';
      } else if (error.message) {
        // Handle client-side validation errors (like version validation)
        errorMessage = error.message;
      } else {
        errorMessage = 'Failed to update item. Please try again.';
      }

      // Always show error toast
      showToast(errorMessage, 'error');
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/items', { replace: true });
  };

  if (!item) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading item data...</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      role="form"
      aria-label="Edit item form"
      encType="multipart/form-data"
      className="w-full max-w-2xl mx-auto"
    >
      {/* Form-level error */}
      {submitError && (
        <ErrorMessage
          message={submitError}
          dataTestid="edit-item-error"
          ariaLive="assertive"
        />
      )}

      {/* Version info (hidden but needed for API) */}
      <input type="hidden" name="version" value={currentVersion} />

      {/* Name */}
      <Input
        type="text"
        label="Item Name"
        value={values.name}
        onChange={(value) => handleChange('name', value)}
        onBlur={() => handleBlur('name')}
        error={touched.name ? errors.name : ''}
        dataTestid="item-name"
        placeholder="Enter item name"
        required
      />

      {/* Description */}
      <div className="mb-5">
        <label htmlFor="item-description" className="block text-sm font-medium text-gray-700 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="item-description"
          value={values.description}
          onChange={(e) => handleChange('description', e.target.value)}
          onBlur={() => handleBlur('description')}
          placeholder="Enter item description"
          rows={4}
          required
          role="textbox"
          aria-label="Item Description"
          aria-invalid={!!(touched.description && errors.description)}
          aria-describedby={touched.description && errors.description ? 'description-error' : undefined}
          data-testid="item-description"
          className={`
            w-full px-4 py-3 text-base border rounded-lg
            transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${touched.description && errors.description
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-400'
            }
            placeholder:text-gray-400
          `}
        />
        {touched.description && errors.description && (
          <div
            id="description-error"
            role="alert"
            aria-live="polite"
            data-testid="description-error"
            className="mt-2 text-sm text-red-600"
          >
            {errors.description}
          </div>
        )}
      </div>

      {/* Item Type */}
      <div className="mb-5">
        <label htmlFor="item-type" className="block text-sm font-medium text-gray-700 mb-2">
          Item Type <span className="text-red-500">*</span>
        </label>
        <select
          id="item-type"
          value={values.item_type}
          onChange={(e) => handleChange('item_type', e.target.value)}
          onBlur={() => handleBlur('item_type')}
          required
          aria-label="Select Item Type"
          aria-invalid={!!(touched.item_type && errors.item_type)}
          data-testid="item-type"
          className={`
            w-full px-4 py-3 text-base border rounded-lg
            transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${touched.item_type && errors.item_type
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-400'
            }
          `}
        >
          <option value="">Select item type</option>
          <option value="PHYSICAL">Physical</option>
          <option value="DIGITAL">Digital</option>
          <option value="SERVICE">Service</option>
        </select>
        {touched.item_type && errors.item_type && (
          <div
            role="alert"
            aria-live="polite"
            data-testid="item-type-error"
            className="mt-2 text-sm text-red-600"
          >
            {errors.item_type}
          </div>
        )}
      </div>

      {/* Conditional Fields */}
      {values.item_type && (
        <ConditionalFields
          itemType={values.item_type}
          formData={values}
          onChange={handleChange}
          errors={errors}
          touched={touched}
          onBlur={handleBlur}
        />
      )}

      {/* Price */}
      <Input
        type="number"
        label="Price"
        value={values.price}
        onChange={(value) => handleChange('price', value)}
        onBlur={() => handleBlur('price')}
        error={touched.price ? errors.price : ''}
        dataTestid="item-price"
        placeholder="0.00"
        step="0.01"
        min="0.01"
        required
      />

      {/* Category */}
      <Input
        type="text"
        label="Category"
        value={values.category}
        onChange={(value) => handleChange('category', value)}
        onBlur={() => handleBlur('category')}
        error={touched.category ? errors.category : ''}
        dataTestid="item-category"
        placeholder="Enter category"
        required
      />

      {/* Tags */}
      <Input
        type="text"
        label="Tags (comma-separated)"
        value={values.tags}
        onChange={(value) => handleChange('tags', value)}
        onBlur={() => handleBlur('tags')}
        error={touched.tags ? errors.tags : ''}
        dataTestid="item-tags"
        placeholder="tag1, tag2, tag3"
      />

      {/* File Upload */}
      <div className="mb-5">
        <FileUpload
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          onFileRemove={handleFileRemove}
          error={fileError}
        />
        {item.file_path && !selectedFile && (
          <p className="mt-2 text-sm text-gray-500">
            Current file: {item.file_metadata?.original_name || item.file_path.split('/').pop()}
            <br />
            <span className="text-xs">Upload a new file to replace the existing one.</span>
          </p>
        )}
      </div>

      {/* Embed URL (Optional - for iframe content) */}
      <div className="mb-5">
        <Input
          type="url"
          label="Embed URL (Optional)"
          value={values.embed_url}
          onChange={(value) => handleChange('embed_url', value)}
          onBlur={() => handleBlur('embed_url')}
          error={touched.embed_url ? errors.embed_url : ''}
          dataTestid="item-embed-url"
          placeholder="https://example.com/embed/content"
        />
        <p className="mt-1 text-sm text-gray-500">
          URL for embedded content (videos, demos, etc.) that will display in item details modal
        </p>
      </div>

      {/* Version Display (read-only) */}
      <div className="mb-5 p-3 bg-gray-50 rounded-lg" role="status" aria-label="Version Control Info">
        <p className="text-sm text-gray-600">
          <strong>Current Version:</strong> <span aria-label={`Version ${currentVersion}`}>{currentVersion}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Version is used to prevent conflicts when multiple users edit the same item.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-6">
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
          dataTestid="edit-item-submit"
          ariaLabel="Update Item Submit"
          className="flex-1"
        >
          Update Item
        </Button>
        <Button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          dataTestid="edit-item-cancel"
          ariaLabel="Cancel Item Edit"
          variant="secondary"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

