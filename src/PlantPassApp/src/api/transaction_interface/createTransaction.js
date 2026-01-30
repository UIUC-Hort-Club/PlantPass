import { API_URL } from "../config";

/**
 * Writes a transaction to the backend.
 *
 * @param {object} transactionData - JSON object with structure:
 * {
 *   "timestamp": 0,
 *   "items": [
 *     {
 *       "SKU": "SKU123",
 *       "item": "Plant A",
 *       "quantity": 2,
 *       "price_ea": 10.00
 *     }
 *   ],
 *   "voucher": 10  // Dollar amount
 * }
 *
 * @returns {object} The full transaction object from backend, including discounts, totals, etc.
 */
export async function createTransaction(transactionData) {
  try {
    const response = await fetch(`${API_URL}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        `HTTP ${response.status}: ${errorBody.message || "Unknown error"}`,
      );
    }

    const data = await response.json();
    return data.transaction;
  } catch (err) {
    console.error("Error writing transaction:", err);
    throw err;
  }
}
