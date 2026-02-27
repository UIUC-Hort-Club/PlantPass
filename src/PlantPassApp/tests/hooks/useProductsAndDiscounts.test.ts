import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProductsAndDiscounts } from '../../src/hooks/useProductsAndDiscounts';
import * as productsApi from '../../src/api/products_interface/getAllProducts';
import * as discountsApi from '../../src/api/discounts_interface/getAllDiscounts';

vi.mock('../../src/api/products_interface/getAllProducts');
vi.mock('../../src/api/discounts_interface/getAllDiscounts');
vi.mock('../../src/utils/productTransformer', () => ({
  transformProductsData: (products: any[]) => products.map((p: any) => ({
    SKU: p.SKU,
    Name: p.item,
    Price: p.price_ea,
  })),
}));

describe('useProductsAndDiscounts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch products and discounts on mount', async () => {
    const mockProducts = [
      { SKU: 'PLANT-001', item: 'Succulent', price_ea: 5.99, sort_order: 1 },
    ];
    const mockDiscounts = [
      { name: '10% Off', type: 'percent' as const, value: 10, sort_order: 1 },
    ];

    vi.spyOn(productsApi, 'getAllProducts').mockResolvedValue(mockProducts);
    vi.spyOn(discountsApi, 'getAllDiscounts').mockResolvedValue(mockDiscounts);

    const { result } = renderHook(() => useProductsAndDiscounts());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Products are transformed
    expect(result.current.products).toEqual([
      { SKU: 'PLANT-001', Name: 'Succulent', Price: 5.99 },
    ]);
    expect(result.current.discounts).toEqual(mockDiscounts);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch errors', async () => {
    const errorMessage = 'Failed to fetch';
    vi.spyOn(productsApi, 'getAllProducts').mockRejectedValue(new Error(errorMessage));
    vi.spyOn(discountsApi, 'getAllDiscounts').mockResolvedValue([]);

    const { result } = renderHook(() => useProductsAndDiscounts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.products).toEqual([]);
  });

  it('should refetch data when refresh is called', async () => {
    const mockProducts = [
      { SKU: 'PLANT-001', item: 'Succulent', price_ea: 5.99, sort_order: 1 },
    ];
    const mockDiscounts = [
      { name: '10% Off', type: 'percent' as const, value: 10, sort_order: 1 },
    ];

    const getProductsSpy = vi.spyOn(productsApi, 'getAllProducts').mockResolvedValue(mockProducts);
    const getDiscountsSpy = vi.spyOn(discountsApi, 'getAllDiscounts').mockResolvedValue(mockDiscounts);

    const { result } = renderHook(() => useProductsAndDiscounts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getProductsSpy).toHaveBeenCalledTimes(1);
    expect(getDiscountsSpy).toHaveBeenCalledTimes(1);

    // Call refresh
    await result.current.refresh();

    await waitFor(() => {
      expect(getProductsSpy).toHaveBeenCalledTimes(2);
      expect(getDiscountsSpy).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle empty data', async () => {
    vi.spyOn(productsApi, 'getAllProducts').mockResolvedValue([]);
    vi.spyOn(discountsApi, 'getAllDiscounts').mockResolvedValue([]);

    const { result } = renderHook(() => useProductsAndDiscounts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.products).toEqual([]);
    expect(result.current.discounts).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
