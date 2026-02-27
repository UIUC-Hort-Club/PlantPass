import { apiRequest } from '../apiClient';
import type { Transaction } from '../../types';

export async function getRecentUnpaidTransactions(limit: number = 5): Promise<Transaction[]> {
  const data = await apiRequest<{ transactions?: Transaction[] }>(`/transactions/recent-unpaid?limit=${limit}`);
  return data.transactions || [];
}
