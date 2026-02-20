import { apiRequest } from '../apiClient';

export const replaceAllProducts = async (products) => {
  return apiRequest('/products', {
    method: 'PUT',
    body: products
  });
};