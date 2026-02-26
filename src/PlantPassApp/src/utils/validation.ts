import type { TransactionItem, PaymentMethod } from '../types';

/**
 * Validation utilities for robust input handling
 * Prevents crashes from invalid user input
 */

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate and sanitize quantity input
 * @param value - User input
 * @returns Valid quantity (0 or positive integer)
 */
export function validateQuantity(value: unknown): number {
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
 * @param value - User input
 * @returns Valid price (0 or positive number with 2 decimals)
 */
export function validatePrice(value: unknown): number {
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
 * @param email - Email to validate
 * @returns True if valid email format
 */
export function validateEmail(email: unknown): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // RFC 5322 simplified regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate order ID format (ABC-DEF)
 * @param orderId - Order ID to validate
 * @returns True if valid format
 */
export function validateOrderId(orderId: unknown): boolean {
  if (!orderId || typeof orderId !== 'string') {
    return false;
  }
  
  // Format: 3 uppercase letters, hyphen, 3 uppercase letters
  const orderIdRegex = /^[A-Z]{3}-[A-Z]{3}$/;
  return orderIdRegex.test(orderId.trim());
}

/**
 * Validate discount value based on type
 * @param value - Discount value
 * @param type - "percent" or "dollar"
 * @returns Valid discount value
 */
export function validateDiscountValue(value: unknown, type: string): number {
  const num = validatePrice(value);
  
  if (type === "percent" || type === "percentage") {
    // Percentage should be 0-100
    return Math.min(100, Math.max(0, num));
  }
  
  // Dollar amount should be non-negative
  return Math.max(0, num);
}

/**
 * Validate SKU format
 * @param sku - SKU to validate
 * @returns True if valid SKU
 */
export function validateSKU(sku: unknown): boolean {
  if (!sku || typeof sku !== 'string') {
    return false;
  }
  
  // SKU should be alphanumeric with optional hyphens/underscores
  const skuRegex = /^[A-Za-z0-9_-]+$/;
  return skuRegex.test(sku.trim()) && sku.trim().length > 0;
}

/**
 * Sanitize string input (prevent XSS)
 * @param input - String to sanitize
 * @param maxLength - Maximum allowed length
 * @returns Sanitized string
 */
export function sanitizeString(input: unknown, maxLength: number = 255): string {
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
 * @param items - Items to validate
 * @returns Validation result with errors
 */
export function validateTransactionItems(items: unknown): ValidationResult {
  const errors: string[] = [];
  
  if (!Array.isArray(items)) {
    return { valid: false, errors: ['Items must be an array'] };
  }
  
  if (items.length === 0) {
    return { valid: false, errors: ['At least one item is required'] };
  }
  
  const hasValidItems = items.some((item: TransactionItem) => {
    const quantity = validateQuantity(item.quantity);
    return quantity > 0;
  });
  
  if (!hasValidItems) {
    errors.push('At least one item must have a quantity greater than 0');
  }
  
  items.forEach((item: TransactionItem, index: number) => {
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
 * @param method - Payment method name
 * @param validMethods - List of valid payment methods
 * @returns True if valid
 */
export function validatePaymentMethod(method: unknown, validMethods: PaymentMethod[] = []): boolean {
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
 * @param value - Value to validate
 * @returns Coerced boolean value
 */
export function validateBoolean(value: unknown): boolean {
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
 * @param value - Value to validate
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clampNumber(value: unknown, min: number = 0, max: number = Infinity): number {
  const num = Number(value);
  
  if (isNaN(num) || !isFinite(num)) {
    return min;
  }
  
  return Math.min(max, Math.max(min, num));
}
