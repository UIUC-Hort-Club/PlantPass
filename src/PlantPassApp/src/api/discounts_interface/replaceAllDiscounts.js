import { apiRequest } from '../apiClient';

export const replaceAllDiscounts = async (discounts) => {
  return apiRequest('/discounts', {
    method: 'PUT',
    body: discounts
  });
};