import { apiRequest } from '../apiClient';
import type { ProductDTO } from '../../types';

export async function getAllProducts(): Promise<ProductDTO[]> {
  return apiRequest<ProductDTO[]>('/products');
}