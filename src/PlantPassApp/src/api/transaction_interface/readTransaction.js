import { apiRequest } from '../apiClient';

export async function readTransaction(transactionId) {
  if (!transactionId) throw new Error("transactionId is required");
  return apiRequest(`/transactions/${transactionId}`);
}
