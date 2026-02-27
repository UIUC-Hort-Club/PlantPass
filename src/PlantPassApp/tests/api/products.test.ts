import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllProducts } from '../../src/api/products_interface/getAllProducts';
import { apiRequest } from '../../src/api/apiClient';

vi.mock('../../src/api/apiClient');

describe('Products API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllProducts', () => {
    it('should fetch all products', async () => {
      const mockProducts = [
        { SKU: 'PLANT-001', item: 'Succulent', price_ea: 5.99, sort_order: 1 },
        { SKU: 'PLANT-002', item: 'Cactus', price_ea: 8.50, sort_order: 2 },
      ];

      vi.mocked(apiRequest).mockResolvedValueOnce(mockProducts);

      const result = await getAllProducts();

      expect(apiRequest).toHaveBeenCalledWith('/products');
      expect(result).toEqual(mockProducts);
    });

    it('should handle empty product list', async () => {
      vi.mocked(apiRequest).mockResolvedValueOnce([]);

      const result = await getAllProducts();

      expect(result).toEqual([]);
    });

    it('should propagate API errors', async () => {
      vi.mocked(apiRequest).mockRejectedValueOnce(new Error('Network error'));

      await expect(getAllProducts()).rejects.toThrow('Network error');
    });
  });
});
