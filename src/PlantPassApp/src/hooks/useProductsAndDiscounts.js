import { useState, useEffect } from 'react';
import { getAllProducts } from '../api/products_interface/getAllProducts';
import { getAllDiscounts } from '../api/discounts_interface/getAllDiscounts';
import { transformProductsData, initializeProductQuantities } from '../utils/productTransformer';

export const useProductsAndDiscounts = () => {
  const [products, setProducts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = async () => {
    try {
      const productsData = await getAllProducts();
      const transformedProducts = transformProductsData(productsData);
      setProducts(transformedProducts);
      return transformedProducts;
    } catch (error) {
      console.error("Error loading products:", error);
      setError("Failed to load products");
      throw error;
    }
  };

  const loadDiscounts = async () => {
    try {
      const discountsData = await getAllDiscounts();
      setDiscounts(discountsData);
      return discountsData;
    } catch (error) {
      console.error("Error loading discounts:", error);
      setError("Failed to load discounts");
      setDiscounts([]);
      throw error;
    }
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [productsData, discountsData] = await Promise.all([
        loadProducts(),
        loadDiscounts()
      ]);
      return { products: productsData, discounts: discountsData };
    } catch (error) {
      setError("Failed to load data");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  return {
    products,
    discounts,
    loading,
    error,
    loadProducts,
    loadDiscounts,
    loadAll,
  };
};