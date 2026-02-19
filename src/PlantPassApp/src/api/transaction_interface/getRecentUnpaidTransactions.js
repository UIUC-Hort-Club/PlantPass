import { API_URL } from "../config";

/**
 * Fetches recent unpaid transactions from the backend.
 *
 * @param {number} limit - Maximum number of transactions to retrieve (default: 5).
 * @returns {Array} Array of recent unpaid transaction objects.
 */
export async function getRecentUnpaidTransactions(limit = 5) {
  try {
    const response = await fetch(
      `${API_URL}/transactions/recent-unpaid?limit=${limit}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        `HTTP ${response.status}: ${errorBody.message || "Unknown error"}`,
      );
    }

    const data = await response.json();
    return data.transactions || [];
  } catch (err) {
    console.error("Error fetching recent unpaid transactions:", err);
    throw err;
  }
}
