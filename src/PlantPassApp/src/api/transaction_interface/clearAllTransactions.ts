import { apiRequest } from "../apiClient";

interface ClearTransactionsResponse {
  message: string;
  cleared_count: number;
}

/**
 * Clears all transactions from the database.
 *
 * @returns Response with the number of cleared transactions.
 */
export async function clearAllTransactions(): Promise<ClearTransactionsResponse> {
  return apiRequest<ClearTransactionsResponse>('/transactions/clear-all', {
    method: 'DELETE'
  });
}