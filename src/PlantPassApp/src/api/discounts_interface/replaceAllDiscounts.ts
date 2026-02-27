import { apiRequest } from '../apiClient';
import type { Discount } from '../../types';

export const replaceAllDiscounts = async (discounts: Discount[]): Promise<void> => {
  return apiRequest<void>('/discounts', {
    method: 'PUT',
    body: discounts
  });
};