import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTransaction } from '../../src/api/transaction_interface/createTransaction';
import { readTransaction } from '../../src/api/transaction_interface/readTransaction';
import { updateTransaction } from '../../src/api/transaction_interface/updateTransaction';
import { deleteTransaction } from '../../src/api/transaction_interface/deleteTransaction';
import { apiRequest } from '../../src/api/apiClient';
import type { CreateTransactionRequest, UpdateTransactionRequest } from '../../src/types';

vi.mock('../../src/api/apiClient');

describe('Transaction Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full transaction lifecycle', async () => {
    // 1. Create transaction
    const createRequest: CreateTransactionRequest = {
      timestamp: Date.now(),
      items: [
        {
          SKU: 'PLANT-001',
          item: 'Succulent',
          quantity: 2,
          price_ea: 5.99,
        },
      ],
      discounts: [
        {
          name: '10% Off',
          type: 'percent',
          value: 10,
          selected: true,
          amount_off: 1.20,
        },
      ],
      voucher: 2.00,
      email: 'customer@example.com',
    };

    const createResponse = {
      transaction: {
        purchase_id: 'ABC-DEF',
        receipt: {
          subtotal: 11.98,
          discount: 3.20,
          total: 8.78,
        },
      },
    };

    (apiRequest as any).mockResolvedValueOnce(createResponse);
    const created = await createTransaction(createRequest);
    
    expect(created.purchase_id).toBe('ABC-DEF');
    expect(created.receipt.total).toBe(8.78);

    // 2. Read transaction
    const readResponse = {
      purchase_id: 'ABC-DEF',
      timestamp: createRequest.timestamp,
      items: createRequest.items,
      discounts: createRequest.discounts,
      voucher: createRequest.voucher,
      email: createRequest.email,
      receipt: createResponse.transaction.receipt,
    };

    (apiRequest as any).mockResolvedValueOnce(readResponse);
    const retrieved = await readTransaction('ABC-DEF');
    
    expect(retrieved.purchase_id).toBe('ABC-DEF');
    expect(retrieved.email).toBe('customer@example.com');

    // 3. Update transaction (mark as paid)
    const updateRequest: UpdateTransactionRequest = {
      payment: {
        method: 'Cash',
        paid: true,
      },
    };

    const updateResponse = {
      transaction: {
        purchase_id: 'ABC-DEF',
        receipt: createResponse.transaction.receipt,
      },
    };

    (apiRequest as any).mockResolvedValueOnce(updateResponse);
    const updated = await updateTransaction('ABC-DEF', updateRequest);
    
    expect(updated.purchase_id).toBe('ABC-DEF');
    expect(apiRequest).toHaveBeenCalledWith(
      '/transactions/ABC-DEF',
      expect.objectContaining({
        method: 'PUT',
        body: expect.objectContaining({
          payment: { method: 'Cash', paid: true },
        }),
      })
    );

    // 4. Delete transaction
    (apiRequest as any).mockResolvedValueOnce(true);
    const deleted = await deleteTransaction('ABC-DEF');
    
    expect(deleted).toBe(true);
    expect(apiRequest).toHaveBeenCalledWith(
      '/transactions/ABC-DEF',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('should handle transaction with multiple items and discounts', async () => {
    const createRequest: CreateTransactionRequest = {
      timestamp: Date.now(),
      items: [
        { SKU: 'PLANT-001', item: 'Succulent', quantity: 3, price_ea: 5.99 },
        { SKU: 'PLANT-002', item: 'Cactus', quantity: 2, price_ea: 8.50 },
        { SKU: 'PLANT-003', item: 'Fern', quantity: 1, price_ea: 12.99 },
      ],
      discounts: [
        { name: '10% Off', type: 'percent', value: 10, selected: true, amount_off: 4.70 },
        { name: '$5 Off', type: 'dollar', value: 5, selected: true, amount_off: 5.00 },
      ],
      voucher: 3.00,
    };

    const createResponse = {
      transaction: {
        purchase_id: 'XYZ-QRS',
        receipt: {
          subtotal: 46.97,
          discount: 12.70,
          total: 34.27,
        },
      },
    };

    (apiRequest as any).mockResolvedValueOnce(createResponse);
    const created = await createTransaction(createRequest);
    
    expect(created.receipt.subtotal).toBe(46.97);
    expect(created.receipt.discount).toBe(12.70);
    expect(created.receipt.total).toBe(34.27);
  });

  it('should handle transaction without email', async () => {
    const createRequest: CreateTransactionRequest = {
      timestamp: Date.now(),
      items: [
        { SKU: 'PLANT-001', item: 'Succulent', quantity: 1, price_ea: 5.99 },
      ],
      discounts: [],
      voucher: 0,
    };

    const createResponse = {
      transaction: {
        purchase_id: 'ABC-DEF',
        receipt: {
          subtotal: 5.99,
          discount: 0,
          total: 5.99,
        },
      },
    };

    (apiRequest as any).mockResolvedValueOnce(createResponse);
    const created = await createTransaction(createRequest);
    
    expect(created.purchase_id).toBe('ABC-DEF');
    expect(apiRequest).toHaveBeenCalledWith(
      '/transactions',
      expect.objectContaining({
        body: expect.not.objectContaining({ email: expect.anything() }),
      })
    );
  });

  it('should handle validation errors during creation', async () => {
    const invalidRequest: CreateTransactionRequest = {
      timestamp: Date.now(),
      items: [],
      discounts: [],
      voucher: 0,
    };

    (apiRequest as any).mockRejectedValueOnce(
      new Error('Invalid transaction data\nAt least one item is required')
    );

    await expect(createTransaction(invalidRequest)).rejects.toThrow(
      'Invalid transaction data'
    );
  });

  it('should handle network errors gracefully', async () => {
    const createRequest: CreateTransactionRequest = {
      timestamp: Date.now(),
      items: [
        { SKU: 'PLANT-001', item: 'Succulent', quantity: 1, price_ea: 5.99 },
      ],
      discounts: [],
      voucher: 0,
    };

    (apiRequest as any).mockRejectedValueOnce(
      new Error('Network error. Please check your internet connection and try again.')
    );

    await expect(createTransaction(createRequest)).rejects.toThrow('Network error');
  });
});
