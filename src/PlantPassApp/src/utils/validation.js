/**
 * Validation utilities for robust input handling
 * Prevents crashes from invalid user input
 */

/**
 * Validate and sanitize quantity input
 * @param {any} value - User input
 * @returns {number} - Valid quantity (0 or positive integer)
 */
export function validateQuantity(value) {
  if (value === "" || value === null || value === undefined) {
    return 0;
  }
  
  const num = Number(value);
  
  if (isNaN(num) || !isFinite(num)) {
    return 0;
  }
  
  // Ensure non-negative integer
  return Math.max(0, Math.floor(num));
}

/**
 * Validate and sanitize price input
 * @param {any} value - User input
 * @returns {number} - Valid price (0 or positive number with 2 decimals)
 */
export function validatePrice(value) {
  if (value === "" || value === null || value === undefined) {
    return 0;
  }
  
  const num = Number(value);
  
  if (isNaN(num) || !isFinite(num)) {
    return 0;
  }
  
  // Ensure non-negative with 2 decimal places
  return Math.max(0, Math.round(num * 100) / 100);
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // RFC 5322 simplified regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate order ID format (ABC-DEF)
 * @param {string} orderId - Order ID to validate
 * @returns {boolean} - True if valid format
 */
export function validateOrderId(orderId) {
  if (!orderId || typeof orderId !== 'string') {
    return false;
  }
  
  // Format: 3 uppercase letters, hyphen, 3 uppercase letters
  const orderIdRegex = /^[A-Z]{3}-[A-Z]{3}$/;
  return orderIdRegex.test(orderId.trim());
}

/**
 * Validate discount value based on type
 * @param {number} value - Discount value
 * @param {string} type - "percent" or "dollar"
 * @returns {number} - Valid discount value
 */
export function validateDiscountValue(value, type) {
  const num = validatePrice(value);
  
  if (type === "percent") {
    // Percentage should be 0-100
    return Math.min(100, Math.max(0, num));
  }
  
  // Dollar amount should be non-negative
  return Math.max(0, num);
}

/**
 * Validate SKU format
 * @param {string} sku - SKU to validate
 * @returns {boolean} - True if valid SKU
 */
export function validateSKU(sku) {
  if (!sku || typeof sku !== 'string') {
    return false;
  }
  
  // SKU should be alphanumeric with optional hyphens/underscores
  const skuRegex = /^[A-Za-z0-9_-]+$/;
  return skuRegex.test(sku.trim()) && sku.trim().length > 0;
}

/**
 * Sanitize string input (prevent XSS)
 * @param {string} input - String to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} - Sanitized string
 */
export function sanitizeString(input, maxLength = 255) {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove HTML tags and trim
  const sanitized = input
    .replace(/<[^>]*>/g, '')
    .trim()
    .slice(0, maxLength);
  
  return sanitized;
}

/**
 * Validate transaction items array
 * @param {Array} items - Items to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validateTransactionItems(items) {
  const errors = [];
  
  if (!Array.isArray(items)) {
    return { valid: false, errors: ['Items must be an array'] };
  }
  
  if (items.length === 0) {
    return { valid: false, errors: ['At least one item is required'] };
  }
  
  const hasValidItems = items.some(item => {
    const quantity = validateQuantity(item.quantity);
    return quantity > 0;
  });
  
  if (!hasValidItems) {
    errors.push('At least one item must have a quantity greater than 0');
  }
  
  items.forEach((item, index) => {
    if (!validateSKU(item.SKU)) {
      errors.push(`Item ${index + 1}: Invalid SKU`);
    }
    
    if (!item.item || typeof item.item !== 'string') {
      errors.push(`Item ${index + 1}: Invalid item name`);
    }
    
    if (validatePrice(item.price_ea) <= 0) {
      errors.push(`Item ${index + 1}: Price must be greater than 0`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate payment method
 * @param {string} method - Payment method name
 * @param {Array} validMethods - List of valid payment methods
 * @returns {boolean} - True if valid
 */
export function validatePaymentMethod(method, validMethods = []) {
  if (!method || typeof method !== 'string') {
    return false;
  }
  
  if (validMethods.length === 0) {
    return true; // No validation if list not provided
  }
  
  return validMethods.some(m => m.name === method);
}

/**
 * Validate feature toggle value
 * @param {any} value - Value to validate
 * @returns {boolean} - Coerced boolean value
 */
export function validateBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }
  
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  
  return Boolean(value);
}

/**
 * Validate and clamp number to range
 * @param {any} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Clamped value
 */
export function clampNumber(value, min = 0, max = Infinity) {
  const num = Number(value);
  
  if (isNaN(num) || !isFinite(num)) {
    return min;
  }
  
  return Math.min(max, Math.max(min, num));
}
