import { useState, useCallback } from 'react';

/**
 * useForm Hook
 * 
 * Reusable form state and validation management.
 * 
 * @param {object} initialValues - Initial form field values
 * @param {object} validationRules - Validation rules for each field
 * @returns {object} - Form state and handlers
 */
export default function useForm(initialValues = {}, validationRules = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  /**
   * Update field value and clear error if exists
   * 
   * @param {string} name - Field name
   * @param {any} value - Field value
   */
  const handleChange = useCallback((name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  /**
   * Mark field as touched and validate
   * 
   * @param {string} name - Field name
   */
  const handleBlur = useCallback((name) => {
    setTouched((prev) => ({
      ...prev,
      [name]: true
    }));

    // Validate field on blur
    validateField(name, values[name]);
  }, [values]);

  /**
   * Validate single field
   * 
   * @param {string} name - Field name
   * @param {any} value - Field value
   * @returns {boolean} - True if valid
   */
  const validateField = useCallback((name, value) => {
    const validator = validationRules[name];
    
    if (!validator) {
      return true; // No validation rule, consider valid
    }

    let error = '';

    // If validator is a function, call it
    if (typeof validator === 'function') {
      error = validator(value);
    } else if (typeof validator === 'object' && validator.validate) {
      // If validator is an object with validate function
      error = validator.validate(value, values);
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error || undefined
    }));

    return !error;
  }, [validationRules, values]);

  /**
   * Validate all fields
   * 
   * @returns {boolean} - True if all fields are valid
   */
  const validateAll = useCallback(() => {
    let isValid = true;
    const newErrors = {};

    Object.keys(validationRules).forEach((name) => {
      const validator = validationRules[name];
      if (!validator) return;

      let error = '';

      if (typeof validator === 'function') {
        error = validator(values[name]);
      } else if (typeof validator === 'object' && validator.validate) {
        error = validator.validate(values[name], values);
      }

      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(
      Object.keys(validationRules).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {})
    );

    return isValid;
  }, [validationRules, values]);

  /**
   * Reset form to initial values
   */
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  /**
   * Set form values (useful for prefilling)
   * 
   * @param {object} newValues - New values to set
   */
  const setFormValues = useCallback((newValues) => {
    setValues((prev) => ({
      ...prev,
      ...newValues
    }));
  }, []);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateField,
    validateAll,
    reset,
    setFormValues,
    setErrors,
    setTouched
  };
}

