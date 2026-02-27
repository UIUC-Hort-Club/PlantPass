import { apiRequest } from '../apiClient';

export async function deleteTransaction(transactionId: string): Promise<void> {
  if (!transactionId) throw new Error("transactionId is required");
  return apiRequest<void>(`/transactions/${transactionId}`, { method: 'DELETE' });
}
