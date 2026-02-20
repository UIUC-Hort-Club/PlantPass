import { apiRequest } from '../apiClient';

export async function getAllProducts() {
  return apiRequest('/products');
}