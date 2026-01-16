import { API_URL } from "../config";

/**
 * Reads a transaction from the backend.
 * 
 * @param {string} transactionId - The purchase_id of the transaction to retrieve.
 * @returns {object} The transaction object from the backend.
 */
export async function readTransaction(transactionId) {
  if (!transactionId) throw new Error("transactionId is required");

  try {
    const response = await fetch(`${API_URL}/transactions/${transactionId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}: ${errorBody.message || "Unknown error"}`);
    }

    const transaction = await response.json();
    return transaction;

  } catch (err) {
    console.error("Error reading transaction:", err);
    throw err;
  }
}
