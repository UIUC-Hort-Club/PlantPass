import { API_URL } from "../config";

/**
 * Updates an existing transaction on the backend.
 *
 * @param {string} transactionId - The purchase_id of the transaction to update.
 * @param {object} updateData - The data to update, e.g. items, voucher, etc.
 * @returns {object} The updated transaction object from the backend.
 */
export async function updateTransaction(transactionId, updateData) {
  if (!transactionId) throw new Error("transactionId is required");

  try {
    const response = await fetch(`${API_URL}/transactions/${transactionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        `HTTP ${response.status}: ${errorBody.message || "Unknown error"}`,
      );
    }

    const data = await response.json();
    console.log(data)
    return data.transaction;
  } catch (err) {
    console.error("Error updating transaction:", err);
    throw err;
  }
}
