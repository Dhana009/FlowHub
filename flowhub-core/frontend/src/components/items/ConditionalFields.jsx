/**
 * Conditional Fields Component
 * 
 * Renders conditional fields based on item type selection.
 * Shows/hides fields dynamically based on item_type.
 */

import Input from '../common/Input';

/**
 * Conditional Fields Component
 * 
 * @param {object} props
 * @param {string} props.itemType - Current item type (PHYSICAL, DIGITAL, SERVICE)
 * @param {object} props.formData - Current form data
 * @param {function} props.onChange - Change handler function
 * @param {object} props.errors - Validation errors object
 * @param {object} props.touched - Touched fields object
 * @param {function} props.onBlur - Blur handler function
 */
export default function ConditionalFields({ 
  itemType, 
  formData, 
  onChange, 
  errors, 
  touched,
  onBlur 
}) {
  // Physical item fields
  if (itemType === 'PHYSICAL') {
    return (
      <div data-testid="physical-fields" className="space-y-4">
        <Input
          type="number"
          label="Weight (kg)"
          value={formData.weight || ''}
          onChange={(value) => onChange('weight', value)}
          onBlur={() => onBlur('weight')}
          error={touched.weight ? errors.weight : ''}
          dataTestid="item-weight"
          placeholder="0.00"
          step="0.01"
          min="0.01"
          required
        />

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dimensions (cm)
          </label>
          
          <div className="grid grid-cols-3 gap-4">
            <Input
              type="number"
              label="Length"
              value={formData.dimensions?.length || ''}
              onChange={(value) => onChange('dimensions', {
                ...formData.dimensions,
                length: value
              })}
              onBlur={() => onBlur('dimensions.length')}
              error={touched['dimensions.length'] ? errors['dimensions.length'] : ''}
              dataTestid="item-dimension-length"
              placeholder="0.00"
              step="0.01"
              min="0.01"
              required
            />

            <Input
              type="number"
              label="Width"
              value={formData.dimensions?.width || ''}
              onChange={(value) => onChange('dimensions', {
                ...formData.dimensions,
                width: value
              })}
              onBlur={() => onBlur('dimensions.width')}
              error={touched['dimensions.width'] ? errors['dimensions.width'] : ''}
              dataTestid="item-dimension-width"
              placeholder="0.00"
              step="0.01"
              min="0.01"
              required
            />

            <Input
              type="number"
              label="Height"
              value={formData.dimensions?.height || ''}
              onChange={(value) => onChange('dimensions', {
                ...formData.dimensions,
                height: value
              })}
              onBlur={() => onBlur('dimensions.height')}
              error={touched['dimensions.height'] ? errors['dimensions.height'] : ''}
              dataTestid="item-dimension-height"
              placeholder="0.00"
              step="0.01"
              min="0.01"
              required
            />
          </div>
        </div>
      </div>
    );
  }

  // Digital item fields
  if (itemType === 'DIGITAL') {
    return (
      <div data-testid="digital-fields" className="space-y-4">
        <Input
          type="url"
          label="Download URL"
          value={formData.download_url || ''}
          onChange={(value) => onChange('download_url', value)}
          onBlur={() => onBlur('download_url')}
          error={touched.download_url ? errors.download_url : ''}
          dataTestid="item-download-url"
          placeholder="https://example.com/download/file.zip"
          required
        />

        <Input
          type="number"
          label="File Size (bytes)"
          value={formData.file_size || ''}
          onChange={(value) => onChange('file_size', value)}
          onBlur={() => onBlur('file_size')}
          error={touched.file_size ? errors.file_size : ''}
          dataTestid="item-file-size"
          placeholder="0"
          min="1"
          required
        />
      </div>
    );
  }

  // Service item fields
  if (itemType === 'SERVICE') {
    return (
      <div data-testid="service-fields" className="space-y-4">
        <Input
          type="number"
          label="Duration (hours)"
          value={formData.duration_hours || ''}
          onChange={(value) => onChange('duration_hours', value)}
          onBlur={() => onBlur('duration_hours')}
          error={touched.duration_hours ? errors.duration_hours : ''}
          dataTestid="item-duration-hours"
          placeholder="0"
          min="1"
          step="1"
          required
        />
      </div>
    );
  }

  // No item type selected
  return null;
}

