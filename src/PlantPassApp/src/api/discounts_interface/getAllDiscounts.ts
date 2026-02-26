import { apiRequest } from '../apiClient';
import type { Discount } from '../../types';

export async function getAllDiscounts(): Promise<Discount[]> {
  return apiRequest<Discount[]>('/discounts');
}