import { apiRequest } from '../apiClient';
import type { ProductDTO } from '../../types';

export const replaceAllProducts = async (products: ProductDTO[]): Promise<void> => {
  return apiRequest<void>('/products', {
    method: 'PUT',
    body: products
  });
};