import { apiRequest } from '../apiClient';

export async function getAllDiscounts() {
  return apiRequest('/discounts');
}