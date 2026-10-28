/**
 * Utility functions for client-side JavaScript form validation
 */

// Regular expressions for common input validations
export const REGEX_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const REGEX_PHONE = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,15}$/;
export const REGEX_URL = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

/**
 * Validate email format
 * @param {string} email 
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  return REGEX_EMAIL.test(email.trim());
};

/**
 * Validate phone number format (at least 10 digits)
 * @param {string} phone 
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== "string") return false;
  const digitsOnly = phone.replace(/\D/g, "");
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
};

/**
 * Validate password strength (minimum length 6)
 * @param {string} password 
 * @param {number} minLength 
 * @returns {boolean}
 */
export const isValidPassword = (password, minLength = 6) => {
  if (!password || typeof password !== "string") return false;
  return password.length >= minLength;
};

/**
 * Validate URL format
 * @param {string} url 
 * @returns {boolean}
 */
export const isValidUrl = (url) => {
  if (!url || typeof url !== "string") return true; // Optional URLs pass if empty
  if (url.startsWith("data:image/")) return true;
  return REGEX_URL.test(url.trim());
};


/**
 * Validate numeric value within optionally specified range
 * @param {number|string} val 
 * @param {number} [min] 
 * @param {number} [max] 
 * @returns {boolean}
 */
export const isValidNumber = (val, min = undefined, max = undefined) => {
  if (val === "" || val === null || val === undefined) return false;
  const num = Number(val);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
};

/**
 * Validate a single field according to specified rules
 * @param {string} fieldName - Display name of the field for error messages
 * @param {any} value - Field value
 * @param {object} rules - Validation rules: { required, email, phone, minLength, maxLength, min, max, matchValue, matchFieldName, url, custom }
 * @returns {string|null} - Error message string or null if valid
 */
export const validateField = (fieldName, value, rules = {}) => {
  const strVal = typeof value === "string" ? value.trim() : value;

  // Required check
  if (rules.required && (strVal === "" || strVal === null || strVal === undefined)) {
    return `${fieldName} is required.`;
  }

  // Skip other checks if empty and not required
  if (!rules.required && (strVal === "" || strVal === null || strVal === undefined)) {
    return null;
  }

  // Email check
  if (rules.email && !isValidEmail(strVal)) {
    return `Please enter a valid email address (e.g. name@example.com).`;
  }

  // Phone check
  if (rules.phone && !isValidPhone(strVal)) {
    return `Please enter a valid phone number with at least 10 digits.`;
  }

  // Password / String Min Length check
  if (rules.minLength && typeof strVal === "string" && strVal.length < rules.minLength) {
    return `${fieldName} must be at least ${rules.minLength} characters long.`;
  }

  // String Max Length check
  if (rules.maxLength && typeof strVal === "string" && strVal.length > rules.maxLength) {
    return `${fieldName} cannot exceed ${rules.maxLength} characters.`;
  }

  // Password Confirmation / Match check
  if (rules.matchValue !== undefined && value !== rules.matchValue) {
    const matchLabel = rules.matchFieldName || "Passwords";
    return `${matchLabel} do not match.`;
  }

  // Numeric checks
  if (rules.number) {
    if (!isValidNumber(value, rules.min, rules.max)) {
      if (rules.min !== undefined && Number(value) < rules.min) {
        return `${fieldName} must be at least ${rules.min}.`;
      }
      if (rules.max !== undefined && Number(value) > rules.max) {
        return `${fieldName} cannot be greater than ${rules.max}.`;
      }
      return `${fieldName} must be a valid number.`;
    }
  }

  // URL check
  if (rules.url && !isValidUrl(strVal)) {
    return `Please enter a valid Web URL (e.g. https://domain.com/image.jpg).`;
  }

  // Custom validation function check
  if (typeof rules.custom === "function") {
    const customResult = rules.custom(value);
    if (customResult && typeof customResult === "string") {
      return customResult;
    }
    if (customResult === false) {
      return `Invalid ${fieldName.toLowerCase()}.`;
    }
  }

  return null;
};

/**
 * Validate an entire object of form data against a set of rules
 * @param {object} formData 
 * @param {object} rulesMap - Map of field keys to rules objects
 * @returns {{ isValid: boolean, errors: object }}
 */
export const validateForm = (formData, rulesMap) => {
  const errors = {};
  let isValid = true;

  Object.keys(rulesMap).forEach((fieldKey) => {
    const fieldConfig = rulesMap[fieldKey];
    const { label, ...rules } = fieldConfig;
    const fieldLabel = label || fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1);
    
    // Dynamic matchValue support (e.g. for confirmPassword)
    if (rules.matchField && formData[rules.matchField] !== undefined) {
      rules.matchValue = formData[rules.matchField];
    }

    const error = validateField(fieldLabel, formData[fieldKey], rules);
    if (error) {
      errors[fieldKey] = error;
      isValid = false;
    }
  });

  return { isValid, errors };
};
