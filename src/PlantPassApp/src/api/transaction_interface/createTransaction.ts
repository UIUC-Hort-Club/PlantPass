import { apiRequest } from '../apiClient';
import type { CreateTransactionRequest, TransactionResponse } from '../../types';

export async function createTransaction(transactionData: CreateTransactionRequest): Promise<TransactionResponse> {
  const data = await apiRequest<{ transaction: TransactionResponse }>('/transactions', {
    method: 'POST',
    body: transactionData
  });
  return data.transaction;
}
