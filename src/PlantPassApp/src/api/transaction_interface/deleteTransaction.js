import { API_URL } from "../config";

/**
 * Deletes a transaction from the backend.
 * 
 * @param {string} transactionId - The purchase_id of the transaction to delete.
 * @returns {boolean} True if deletion succeeded.
 */
export async function deleteTransaction(transactionId) {
  if (!transactionId) throw new Error("transactionId is required");

  try {
    const response = await fetch(`${API_URL}/transactions/${transactionId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}: ${errorBody.message || "Unknown error"}`);
    }

    // Lambda returns 204 No Content, so just return true
    return true;

  } catch (err) {
    console.error("Error deleting transaction:", err);
    throw err;
  }
}
