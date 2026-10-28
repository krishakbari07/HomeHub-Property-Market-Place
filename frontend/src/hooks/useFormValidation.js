import { useState, useCallback } from "react";
import { validateField, validateForm } from "../utils/validation";

/**
 * Reusable React Hook for JavaScript Form Validation
 * @param {object} initialValues - Initial form values
 * @param {object} validationSchema - Validation rules map for fields
 * @returns {object} Form state and helper handlers
 */
export const useFormValidation = (initialValues = {}, validationSchema = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate a single field
  const validateSingleField = useCallback(
    (name, value, currentValues = values) => {
      const fieldConfig = validationSchema[name];
      if (!fieldConfig) return null;

      const { label, ...rules } = fieldConfig;
      const fieldLabel = label || name.charAt(0).toUpperCase() + name.slice(1);

      if (rules.matchField && currentValues[rules.matchField] !== undefined) {
        rules.matchValue = currentValues[rules.matchField];
      }

      return validateField(fieldLabel, value, rules);
    },
    [validationSchema, values]
  );

  // Handle onChange event for standard input, select, textarea
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const fieldValue = type === "checkbox" ? checked : value;

      setValues((prev) => {
        const nextValues = { ...prev, [name]: fieldValue };

        // Re-validate field if touched or already has error
        if (touched[name] || errors[name]) {
          const fieldError = validateSingleField(name, fieldValue, nextValues);
          setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: fieldError,
          }));
        }

        return nextValues;
      });
    },
    [touched, errors, validateSingleField]
  );

  // Set field value programmatically
  const setFieldValue = useCallback(
    (name, value) => {
      setValues((prev) => {
        const nextValues = { ...prev, [name]: value };
        if (touched[name] || errors[name]) {
          const fieldError = validateSingleField(name, value, nextValues);
          setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: fieldError,
          }));
        }
        return nextValues;
      });
    },
    [touched, errors, validateSingleField]
  );

  // Handle onBlur event
  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));

      const fieldError = validateSingleField(name, value);
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: fieldError,
      }));
    },
    [validateSingleField]
  );

  // Validate all fields manually
  const validateAll = useCallback(() => {
    const { isValid, errors: formErrors } = validateForm(values, validationSchema);
    setErrors(formErrors);
    
    // Mark all fields as touched
    const allTouched = Object.keys(validationSchema).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    return isValid;
  }, [values, validationSchema]);

  // Form submission wrapper
  const handleSubmit = (onSubmitCallback) => async (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }

    const isValid = validateAll();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await onSubmitCallback(values);
    } catch (err) {
      console.error("Form submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to initial or new state
  const resetForm = useCallback(
    (newValues = initialValues) => {
      setValues(newValues);
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
    },
    [initialValues]
  );

  return {
    values,
    setValues,
    setFieldValue,
    errors,
    setErrors,
    touched,
    setTouched,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleBlur,
    validateAll,
    handleSubmit,
    resetForm,
  };
};

export default useFormValidation;
