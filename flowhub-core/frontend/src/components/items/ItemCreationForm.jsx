/**
 * Item Creation Form Component
 * 
 * Main form component for creating items with conditional fields and file upload.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { createItem } from '../../services/itemService';
import Input from '../common/Input';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';
import ConditionalFields from './ConditionalFields';
import FileUpload from './FileUpload';

/**
 * Item Creation Form
 */
export default function ItemCreationForm() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');

  // Initial form values
  const initialValues = {
    name: '',
    description: '',
    item_type: '',
    price: '',
    category: '',
    tags: '',
    // Conditional fields
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    download_url: '',
    file_size: '',
    duration_hours: ''
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
  } = useForm(initialValues, baseValidationRules);

  // Clear conditional fields when item_type changes
  useEffect(() => {
    if (!values.item_type) {
      return;
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
  }, [values.item_type, setFormValues, setErrors, setTouched]);

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
      // Prepare item data
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

      // Create item
      const result = await createItem(itemData, selectedFile);
      
      // Check if response matches PRD success format
      if (result.status === 'success' && result.data) {
        // Success - redirect to items list
        navigate('/items', { 
          replace: true,
          state: { message: 'Item created successfully!' }
        });
      }
    } catch (error) {
      // Handle error - PRD format
      let errorMessage = 'Failed to create item. Please try again.';
      let fieldErrors = {};

      if (error.statusCode === 401) {
        errorMessage = 'Authentication required. Please log in.';
        navigate('/login', { replace: true });
        return;
      } else if (error.statusCode === 413) {
        errorMessage = 'File too large. Max size: 5MB';
        setFileError(errorMessage);
      } else if (error.statusCode === 415) {
        errorMessage = 'File type not supported. Allowed types: .jpg, .jpeg, .png, .pdf, .doc, .docx';
        setFileError(errorMessage);
      } else if (error.statusCode === 422) {
        // Schema validation errors - may have field-specific errors
        errorMessage = error.message || 'Validation failed. Please check your input.';
        if (error.details && Array.isArray(error.details)) {
          // Map field errors from details array
          error.details.forEach(detail => {
            if (detail.field) {
              fieldErrors[detail.field] = detail.message;
            }
          });
          // Update form errors
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
      } else if (error.statusCode === 409) {
        errorMessage = error.message || 'Item with same name and category already exists.';
      } else if (error.statusCode === 500) {
        errorMessage = 'Something went wrong. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/items', { replace: true });
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="form"
      aria-label="Create item form"
      encType="multipart/form-data"
      className="w-full max-w-2xl mx-auto"
    >
      {/* Form-level error */}
      {submitError && (
        <ErrorMessage
          message={submitError}
          dataTestid="create-item-error"
          ariaLive="assertive"
        />
      )}

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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={values.description}
          onChange={(e) => handleChange('description', e.target.value)}
          onBlur={() => handleBlur('description')}
          placeholder="Enter item description"
          rows={4}
          required
          role="textbox"
          aria-label="Description"
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Item Type <span className="text-red-500">*</span>
        </label>
        <select
          value={values.item_type}
          onChange={(e) => handleChange('item_type', e.target.value)}
          onBlur={() => handleBlur('item_type')}
          required
          role="combobox"
          aria-label="Item Type"
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
      <FileUpload
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
        onFileRemove={handleFileRemove}
        error={fileError}
      />

      {/* Buttons */}
      <div className="flex gap-4 mt-6">
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
          dataTestid="create-item-submit"
          className="flex-1"
        >
          Create Item
        </Button>
        <Button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          dataTestid="create-item-cancel"
          variant="secondary"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

