import { apiRequest } from '../apiClient';
import type { UpdateTransactionRequest, TransactionResponse } from '../../types';

export async function updateTransaction(
  transactionId: string,
  updateData: UpdateTransactionRequest
): Promise<TransactionResponse> {
  if (!transactionId) throw new Error("transactionId is required");
  
  const data = await apiRequest<{ transaction: TransactionResponse }>(`/transactions/${transactionId}`, {
    method: 'PUT',
    body: updateData
  });
  return data.transaction;
}
