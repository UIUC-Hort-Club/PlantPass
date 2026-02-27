import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTransaction } from '../../src/api/transaction_interface/createTransaction';
import { apiRequest } from '../../src/api/apiClient';
import type { CreateTransactionRequest } from '../../src/types';

vi.mock('../../src/api/apiClient');

describe('Transaction API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTransaction', () => {
    it('should create transaction with valid data', async () => {
      const mockRequest: CreateTransactionRequest = {
        timestamp: Date.now(),
        items: [
          {
            SKU: 'TEST-001',
            item: 'Test Product',
            quantity: 2,
            price_ea: 10.99,
          },
        ],
        discounts: [],
        voucher: 0,
      };

      const mockResponse = {
        transaction: {
          purchase_id: 'ABC-DEF',
          receipt: {
            subtotal: 21.98,
            discount: 0,
            total: 21.98,
          },
        },
      };

      vi.mocked(apiRequest).mockResolvedValueOnce(mockResponse);

      const result = await createTransaction(mockRequest);

      expect(apiRequest).toHaveBeenCalledWith('/transactions', {
        method: 'POST',
        body: mockRequest,
      });
      expect(result).toEqual(mockResponse.transaction);
    });

    it('should handle transaction with discounts', async () => {
      const mockRequest: CreateTransactionRequest = {
        timestamp: Date.now(),
        items: [
          {
            SKU: 'TEST-001',
            item: 'Test Product',
            quantity: 1,
            price_ea: 100,
          },
        ],
        discounts: [
          {
            name: '10% Off',
            type: 'percent',
            value: 10,
            selected: true,
            amount_off: 10,
          },
        ],
        voucher: 5,
      };

      const mockResponse = {
        transaction: {
          purchase_id: 'ABC-DEF',
          receipt: {
            subtotal: 100,
            discount: 15,
            total: 85,
          },
        },
      };

      vi.mocked(apiRequest).mockResolvedValueOnce(mockResponse);

      const result = await createTransaction(mockRequest);

      expect(result.receipt.total).toBe(85);
    });

    it('should handle email in transaction', async () => {
      const mockRequest: CreateTransactionRequest = {
        timestamp: Date.now(),
        items: [
          {
            SKU: 'TEST-001',
            item: 'Test Product',
            quantity: 1,
            price_ea: 10,
          },
        ],
        discounts: [],
        voucher: 0,
        email: 'test@example.com',
      };

      const mockResponse = {
        transaction: {
          purchase_id: 'ABC-DEF',
          receipt: {
            subtotal: 10,
            discount: 0,
            total: 10,
          },
        },
      };

      vi.mocked(apiRequest).mockResolvedValueOnce(mockResponse);

      await createTransaction(mockRequest);

      expect(apiRequest).toHaveBeenCalledWith(
        '/transactions',
        expect.objectContaining({
          body: expect.objectContaining({
            email: 'test@example.com',
          }),
        })
      );
    });

    it('should propagate API errors', async () => {
      const mockRequest: CreateTransactionRequest = {
        timestamp: Date.now(),
        items: [],
        discounts: [],
        voucher: 0,
      };

      vi.mocked(apiRequest).mockRejectedValueOnce(new Error('Validation failed'));

      await expect(createTransaction(mockRequest)).rejects.toThrow('Validation failed');
    });
  });
});
