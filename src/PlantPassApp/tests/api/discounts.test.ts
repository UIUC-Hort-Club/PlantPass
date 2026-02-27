import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllDiscounts } from '../../src/api/discounts_interface/getAllDiscounts';
import { apiRequest } from '../../src/api/apiClient';

vi.mock('../../src/api/apiClient');

describe('Discounts API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllDiscounts', () => {
    it('should fetch all discounts', async () => {
      const mockDiscounts = [
        { name: '10% Off', type: 'percent' as const, value: 10, sort_order: 1 },
        { name: '$5 Off', type: 'dollar' as const, value: 5, sort_order: 2 },
      ];

      (apiRequest as any).mockResolvedValueOnce(mockDiscounts);

      const result = await getAllDiscounts();

      expect(apiRequest).toHaveBeenCalledWith('/discounts');
      expect(result).toEqual(mockDiscounts);
    });

    it('should handle empty discount list', async () => {
      (apiRequest as any).mockResolvedValueOnce([]);

      const result = await getAllDiscounts();

      expect(result).toEqual([]);
    });

    it('should propagate API errors', async () => {
      (apiRequest as any).mockRejectedValueOnce(new Error('Failed to fetch'));

      await expect(getAllDiscounts()).rejects.toThrow('Failed to fetch');
    });
  });
});
