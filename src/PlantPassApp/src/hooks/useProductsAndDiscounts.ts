import { useState, useEffect, useCallback } from 'react';
import { getAllProducts } from '../api/products_interface/getAllProducts';
import { getAllDiscounts } from '../api/discounts_interface/getAllDiscounts';
import { transformProductsData } from '../utils/productTransformer';
import type { Product, Discount } from '../types';

interface UseProductsAndDiscountsReturn {
  products: Product[];
  discounts: Discount[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastFetched: number | null;
}

/**
 * Custom hook to preload and cache products and discounts
 * Optimizes performance by loading data once and sharing across components
 */
export function useProductsAndDiscounts(): UseProductsAndDiscountsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  const loadData = useCallback(async (forceRefresh: boolean = false): Promise<void> => {
    // Use cached data if available and not forcing refresh
    if (!forceRefresh && products.length > 0 && discounts.length > 0) {
      // Check if data is less than 5 minutes old
      if (lastFetched && Date.now() - lastFetched < 5 * 60 * 1000) {
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      // Load products and discounts in parallel for speed
      const [productsData, discountsData] = await Promise.all([
        getAllProducts(),
        getAllDiscounts()
      ]);

      const transformedProducts = transformProductsData(productsData);
      setProducts(transformedProducts);
      setDiscounts(discountsData);
      setLastFetched(Date.now());
    } catch (err) {
      console.error('Error loading products and discounts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
      
      // Keep existing data if refresh fails
      if (products.length === 0) {
        setProducts([]);
      }
      if (discounts.length === 0) {
        setDiscounts([]);
      }
    } finally {
      setLoading(false);
    }
  }, [products.length, discounts.length, lastFetched]);

  useEffect(() => {
    loadData();
  }, []);

  const refresh = useCallback((): Promise<void> => {
    return loadData(true);
  }, [loadData]);

  return {
    products,
    discounts,
    loading,
    error,
    refresh,
    lastFetched
  };
}
