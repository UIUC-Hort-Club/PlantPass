import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiRequest, apiRequestWithRetry, clearAuth } from '../../src/api/apiClient';

describe('apiClient', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('apiRequest', () => {
    it('should make successful GET request', async () => {
      const mockData = { data: 'test' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const result = await apiRequest('/test');
      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should include auth token when available', async () => {
      localStorage.setItem('admin_token', 'test-token');
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      await apiRequest('/test');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('should handle POST request with body', async () => {
      const body = { name: 'test' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ success: true }),
      });

      await apiRequest('/test', { method: 'POST', body });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        })
      );
    });

    it('should handle 204 No Content', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await apiRequest('/test', { method: 'DELETE' });
      expect(result).toBe(true);
    });

    it('should handle 401 and clear auth', async () => {
      localStorage.setItem('admin_token', 'test-token');
      const originalLocation = window.location;
      delete (window as any).location;
      window.location = { ...originalLocation, href: '' } as any;

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      });

      await expect(apiRequest('/test')).rejects.toThrow();
      expect(localStorage.getItem('admin_token')).toBeNull();

      window.location = originalLocation;
    });

    it('should handle 403 Forbidden', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ message: 'Access denied' }),
      });

      await expect(apiRequest('/test')).rejects.toThrow('Access denied');
    });

    it('should handle 400 with validation errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          message: 'Validation failed',
          errors: ['Field is required', 'Invalid format'],
        }),
      });

      await expect(apiRequest('/test')).rejects.toThrow('Validation failed');
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Failed to fetch'));

      await expect(apiRequest('/test')).rejects.toThrow('Network error');
    });

    it('should handle timeout', async () => {
      (global.fetch as any).mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100);
          })
      );

      await expect(apiRequest('/test', { timeout: 10 })).rejects.toThrow();
    });
  });

  describe('apiRequestWithRetry', () => {
    it('should retry on server errors', async () => {
      (global.fetch as any)
        .mockRejectedValueOnce(new Error('Server error'))
        .mockRejectedValueOnce(new Error('Server error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ success: true }),
        });

      const result = await apiRequestWithRetry('/test', {}, 3);
      expect(result).toEqual({ success: true });
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should not retry on 400 errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Bad request' }),
      });

      await expect(apiRequestWithRetry('/test', {}, 3)).rejects.toThrow();
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should throw after max retries', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Server error'));

      await expect(apiRequestWithRetry('/test', {}, 2)).rejects.toThrow();
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('clearAuth', () => {
    it('should clear all auth tokens', () => {
      localStorage.setItem('admin_token', 'admin');
      localStorage.setItem('staff_token', 'staff');
      localStorage.setItem('admin_auth', 'true');
      localStorage.setItem('plantpass_auth', 'true');

      clearAuth();

      expect(localStorage.getItem('admin_token')).toBeNull();
      expect(localStorage.getItem('staff_token')).toBeNull();
      expect(localStorage.getItem('admin_auth')).toBeNull();
      expect(localStorage.getItem('plantpass_auth')).toBeNull();
    });
  });
});
