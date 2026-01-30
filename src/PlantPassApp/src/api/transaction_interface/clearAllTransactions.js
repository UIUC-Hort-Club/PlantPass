import { API_URL } from "../config";

/**
 * Clears all transactions from the database.
 *
 * @returns {object} Response with the number of cleared transactions.
 */
export async function clearAllTransactions() {
  try {
    const response = await fetch(`${API_URL}/transactions/clear-all`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        `HTTP ${response.status}: ${errorBody.message || "Unknown error"}`,
      );
    }

    const result = await response.json();
    return result;
  } catch (err) {
    console.error("Error clearing transactions:", err);
    throw err;
  }
}