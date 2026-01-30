import { API_URL } from "../config";

/**
 * Retrieves all discounts from the backend.
 *
 * @returns {Array} Array of discount objects with structure:
 * [
 *   {
 *     "name": "Student Discount",
 *     "percent_off": 10.0
 *   }
 * ]
 */
export async function getAllDiscounts() {
  try {
    const response = await fetch(`${API_URL}/discounts`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        `HTTP ${response.status}: ${errorBody.message || "Unknown error"}`,
      );
    }

    const discounts = await response.json();
    return discounts;
  } catch (err) {
    console.error("Error retrieving discounts:", err);
    throw err;
  }
}