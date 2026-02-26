import { API_URL } from "../config";

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
  try {
    const response = await fetch(`${API_URL}/transactions/clear-all`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({})) as { message?: string };
      throw new Error(
        `HTTP ${response.status}: ${errorBody.message || "Unknown error"}`,
      );
    }

    const result = await response.json() as ClearTransactionsResponse;
    return result;
  } catch (err) {
    console.error("Error clearing transactions:", err);
    throw err;
  }
}