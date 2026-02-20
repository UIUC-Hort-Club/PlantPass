import { apiRequest } from '../apiClient';

export async function deleteTransaction(transactionId) {
  if (!transactionId) throw new Error("transactionId is required");
  return apiRequest(`/transactions/${transactionId}`, { method: 'DELETE' });
}
