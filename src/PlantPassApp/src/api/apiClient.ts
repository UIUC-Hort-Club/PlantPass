import { API_URL } from './config';
import type { ApiRequestOptions } from '../types';

/**
 * Get the current authentication token from localStorage
 */
function getAuthToken(): string | null {
  return localStorage.getItem('admin_token') || localStorage.getItem('staff_token');
}

/**
 * Clear all authentication tokens and state
 */
export function clearAuth(): void {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('staff_token');
  localStorage.removeItem('admin_auth');
  localStorage.removeItem('plantpass_auth');
}

/**
 * Parse error response and return user-friendly message
 */
function parseErrorMessage(error: Error, response?: Response): string {
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
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, timeout = 30000, ...rest } = options;
  
  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    // Get authentication token
    const token = getAuthToken();
    
    // Build headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers as Record<string, string>
    };
    
    // Add Authorization header if token exists
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    const fetchOptions: RequestInit = {
      method,
      headers: requestHeaders,
      signal: controller.signal,
      ...rest
    };

    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, fetchOptions);

    clearTimeout(timeoutId);

    // Handle 401 Unauthorized - clear auth and redirect to home
    if (response.status === 401) {
      clearAuth();
      window.location.href = '/';
      throw new Error('Session expired. Please log in again.');
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
      const errorBody = await response.json().catch(() => ({})) as { error?: string; message?: string };
      const message = errorBody.error || errorBody.message || 'Access denied';
      throw new Error(message);
    }

    // Handle other error responses
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({})) as { 
        message?: string; 
        error?: string; 
        errors?: string[] 
      };
      
      // Use backend error message if available, otherwise use friendly message
      const backendMessage = errorBody.message || errorBody.error;
      const friendlyMessage = parseErrorMessage(new Error(), response);
      
      // For validation errors, include specific error details
      if (response.status === 400 && errorBody.errors) {
        throw new Error(`${backendMessage}\n${errorBody.errors.join('\n')}`);
      }
      
      throw new Error(backendMessage || friendlyMessage);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return true as T;
    }

    return response.json() as Promise<T>;
  } catch (err) {
    clearTimeout(timeoutId);
    
    // If error already has a message, use it
    if (err instanceof Error && err.message) {
      throw err;
    }
    
    // Otherwise, parse and create friendly error
    const error = err instanceof Error ? err : new Error('Unknown error');
    const friendlyMessage = parseErrorMessage(error, undefined);
    console.error(`API request failed: ${method} ${endpoint}`, err);
    throw new Error(friendlyMessage);
  }
}

/**
 * Retry an API request with exponential backoff
 * Useful for transient errors during high traffic
 */
export async function apiRequestWithRetry<T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {},
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error = new Error('Unknown error');
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiRequest<T>(endpoint, options);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (lastError.message.includes('400') || 
          lastError.message.includes('401') || 
          lastError.message.includes('403') || 
          lastError.message.includes('404')) {
        throw lastError;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        throw lastError;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.log(`Retrying request (attempt ${attempt + 2}/${maxRetries})...`);
    }
  }
  
  throw lastError;
}
