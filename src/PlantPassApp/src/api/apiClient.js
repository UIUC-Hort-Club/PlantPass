import { API_URL } from './config';

/**
 * Get the current authentication token from localStorage
 */
function getAuthToken() {
  return localStorage.getItem('admin_token') || localStorage.getItem('staff_token');
}

/**
 * Clear all authentication tokens and state
 */
export function clearAuth() {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('staff_token');
  localStorage.removeItem('admin_auth');
  localStorage.removeItem('plantpass_auth');
}

/**
 * Parse error response and return user-friendly message
 */
function parseErrorMessage(error, response) {
  // Network errors
  if (error.message === 'Failed to fetch') {
    return 'Network error. Please check your internet connection and try again.';
  }
  
  // Timeout errors
  if (error.name === 'AbortError') {
    return 'Request timed out. Please try again.';
  }
  
  // HTTP status errors
  if (response) {
    switch (response.status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Session expired. Please log in again.';
      case 403:
        return 'Access denied. You do not have permission for this action.';
      case 404:
        return 'Resource not found.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again in a few moments.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return `Error: ${response.status}. Please try again.`;
    }
  }
  
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Make an authenticated API request with improved error handling
 */
export async function apiRequest(endpoint, options = {}) {
  const { method = 'GET', body, headers = {}, timeout = 30000, ...rest } = options;
  
  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    // Get authentication token
    const token = getAuthToken();
    
    // Build headers
    const requestHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    
    // Add Authorization header if token exists
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      ...(body && { body: JSON.stringify(body) }),
      signal: controller.signal,
      ...rest
    });

    clearTimeout(timeoutId);

    // Handle 401 Unauthorized - clear auth and redirect to home
    if (response.status === 401) {
      clearAuth();
      window.location.href = '/';
      throw new Error('Session expired. Please log in again.');
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
      const errorBody = await response.json().catch(() => ({}));
      const message = errorBody.error || errorBody.message || 'Access denied';
      throw new Error(message);
    }

    // Handle other error responses
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      
      // Use backend error message if available, otherwise use friendly message
      const backendMessage = errorBody.message || errorBody.error;
      const friendlyMessage = parseErrorMessage(null, response);
      
      // For validation errors, include specific error details
      if (response.status === 400 && errorBody.errors) {
        throw new Error(`${backendMessage}\n${errorBody.errors.join('\n')}`);
      }
      
      throw new Error(backendMessage || friendlyMessage);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return true;
    }

    return response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    
    // If error already has a message, use it
    if (err.message) {
      throw err;
    }
    
    // Otherwise, parse and create friendly error
    const friendlyMessage = parseErrorMessage(err, null);
    console.error(`API request failed: ${method} ${endpoint}`, err);
    throw new Error(friendlyMessage);
  }
}

/**
 * Retry an API request with exponential backoff
 * Useful for transient errors during high traffic
 */
export async function apiRequestWithRetry(endpoint, options = {}, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiRequest(endpoint, options);
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (error.message.includes('400') || 
          error.message.includes('401') || 
          error.message.includes('403') || 
          error.message.includes('404')) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.log(`Retrying request (attempt ${attempt + 2}/${maxRetries})...`);
    }
  }
  
  throw lastError;
}
