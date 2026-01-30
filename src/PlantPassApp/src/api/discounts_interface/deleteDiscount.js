import { API_URL } from "../config";

/**
 * Deletes a discount from the backend.
 *
 * @param {string} name - The name of the discount to delete
 * @returns {void}
 */
export async function deleteDiscount(name) {
  if (!name) throw new Error("Discount name is required");

  try {
    const response = await fetch(`${API_URL}/discounts/${encodeURIComponent(name)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        `HTTP ${response.status}: ${errorBody.message || "Unknown error"}`,
      );
    }

    // 204 No Content response has no body
  } catch (err) {
    console.error("Error deleting discount:", err);
    throw err;
  }
}