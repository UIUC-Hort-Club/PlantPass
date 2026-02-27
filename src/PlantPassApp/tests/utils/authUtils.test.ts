import { describe, it, expect, beforeEach } from 'vitest';
import { setAuthToken, getAuthToken, clearAuthToken, isAuthenticated } from '../../src/utils/authUtils';

describe('authUtils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('setAuthToken', () => {
    it('should store admin token', () => {
      setAuthToken('test-token', 'admin');
      expect(localStorage.getItem('admin_token')).toBe('test-token');
    });

    it('should store staff token', () => {
      setAuthToken('test-token', 'staff');
      expect(localStorage.getItem('staff_token')).toBe('test-token');
    });

    it('should set auth flag', () => {
      setAuthToken('test-token', 'admin');
      expect(localStorage.getItem('admin_auth')).toBe('true');
    });
  });

  describe('getAuthToken', () => {
    it('should retrieve admin token', () => {
      localStorage.setItem('admin_token', 'admin-token');
      expect(getAuthToken()).toBe('admin-token');
    });

    it('should retrieve staff token', () => {
      localStorage.setItem('staff_token', 'staff-token');
      expect(getAuthToken()).toBe('staff-token');
    });

    it('should prioritize admin token', () => {
      localStorage.setItem('admin_token', 'admin-token');
      localStorage.setItem('staff_token', 'staff-token');
      expect(getAuthToken()).toBe('admin-token');
    });

    it('should return null when no token exists', () => {
      expect(getAuthToken()).toBeNull();
    });
  });

  describe('clearAuthToken', () => {
    it('should clear all auth tokens', () => {
      localStorage.setItem('admin_token', 'admin');
      localStorage.setItem('staff_token', 'staff');
      localStorage.setItem('admin_auth', 'true');
      
      clearAuthToken();
      
      expect(localStorage.getItem('admin_token')).toBeNull();
      expect(localStorage.getItem('staff_token')).toBeNull();
      expect(localStorage.getItem('admin_auth')).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when admin token exists', () => {
      localStorage.setItem('admin_token', 'token');
      expect(isAuthenticated()).toBe(true);
    });

    it('should return true when staff token exists', () => {
      localStorage.setItem('staff_token', 'token');
      expect(isAuthenticated()).toBe(true);
    });

    it('should return false when no token exists', () => {
      expect(isAuthenticated()).toBe(false);
    });
  });
});
