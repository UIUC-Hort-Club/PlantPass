import { apiRequest } from '../apiClient';

export async function getRecentUnpaidTransactions(limit = 5) {
  const data = await apiRequest(`/transactions/recent-unpaid?limit=${limit}`);
  return data.transactions || [];
}
