import type { ProductDTO, Product } from '../types';

interface ProductQuantities {
  initialQuantities: Record<string, string>;
  initialSubtotals: Record<string, string>;
}

export const transformProductsData = (productsData: ProductDTO[]): Product[] => {
  return productsData.map(product => ({
    SKU: product.SKU,
    Name: product.item,
    Price: Number(product.price_ea) || 0
  }));
};

export const initializeProductQuantities = (products: Product[]): ProductQuantities => {
  const initialQuantities: Record<string, string> = {};
  const initialSubtotals: Record<string, string> = {};
  
  products.forEach((item) => {
    initialQuantities[item.SKU] = "";
    initialSubtotals[item.SKU] = "0.00";
  });
  
  return { initialQuantities, initialSubtotals };
};