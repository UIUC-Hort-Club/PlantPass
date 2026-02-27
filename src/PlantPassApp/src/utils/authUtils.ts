/**
 * Authentication utility functions
 */

/**
 * Check if user has any valid authentication token
 */
export function isAuthenticated(): boolean {
  return !!(localStorage.getItem('admin_token') || localStorage.getItem('staff_token'));
}

/**
 * Check if user has admin token
 */
export function isAdmin(): boolean {
  return !!localStorage.getItem('admin_token');
}

/**
 * Check if user has staff token (but not admin)
 */
export function isStaff(): boolean {
  return !!localStorage.getItem('staff_token') && !localStorage.getItem('admin_token');
}

/**
 * Logout user by clearing all tokens and auth state
 */
export function logout(): void {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('staff_token');
  localStorage.removeItem('admin_auth');
  localStorage.removeItem('plantpass_auth');
}

/**
 * Get the current auth token (admin takes precedence)
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('admin_token') || localStorage.getItem('staff_token');
}

/**
 * Set authentication token
 */
export function setAuthToken(token: string, role: 'admin' | 'staff'): void {
  if (role === 'admin') {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_auth', 'true');
  } else {
    localStorage.setItem('staff_token', token);
  }
}

/**
 * Clear authentication token
 */
export function clearAuthToken(): void {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('staff_token');
  localStorage.removeItem('admin_auth');
  localStorage.removeItem('plantpass_auth');
}
