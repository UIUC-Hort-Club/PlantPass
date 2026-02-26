import { apiRequest } from '../apiClient';
import type { Transaction } from '../../types';

export async function readTransaction(transactionId: string): Promise<Transaction> {
  if (!transactionId) throw new Error("transactionId is required");
  return apiRequest<Transaction>(`/transactions/${transactionId}`);
}
