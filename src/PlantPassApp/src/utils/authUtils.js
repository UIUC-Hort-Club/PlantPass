/**
 * Authentication utility functions
 */

/**
 * Check if user has any valid authentication token
 */
export function isAuthenticated() {
  return !!(localStorage.getItem('admin_token') || localStorage.getItem('staff_token'));
}

/**
 * Check if user has admin token
 */
export function isAdmin() {
  return !!localStorage.getItem('admin_token');
}

/**
 * Check if user has staff token (but not admin)
 */
export function isStaff() {
  return !!localStorage.getItem('staff_token') && !localStorage.getItem('admin_token');
}

/**
 * Logout user by clearing all tokens and auth state
 */
export function logout() {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('staff_token');
  localStorage.removeItem('admin_auth');
  localStorage.removeItem('plantpass_auth');
}

/**
 * Get the current auth token (admin takes precedence)
 */
export function getAuthToken() {
  return localStorage.getItem('admin_token') || localStorage.getItem('staff_token');
}
