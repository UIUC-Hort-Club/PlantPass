import { apiRequest } from '../apiClient';

export async function createTransaction(transactionData) {
  const data = await apiRequest('/transactions', {
    method: 'POST',
    body: transactionData
  });
  return data.transaction;
}
