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
 * Make an authenticated API request
 */
export async function apiRequest(endpoint, options = {}) {
  const { method = 'GET', body, headers = {}, ...rest } = options;
  
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
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      ...(body && { body: JSON.stringify(body) }),
      ...rest
    });

    // Handle 401 Unauthorized - clear auth and redirect to home
    if (response.status === 401) {
      clearAuth();
      window.location.href = '/';
      throw new Error('Session expired. Please log in again.');
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || errorBody.message || 'Access denied');
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}: ${errorBody.message || errorBody.error || 'Unknown error'}`);
    }

    if (response.status === 204) {
      return true;
    }

    return response.json();
  } catch (err) {
    console.error(`API request failed: ${method} ${endpoint}`, err);
    throw err;
  }
}
