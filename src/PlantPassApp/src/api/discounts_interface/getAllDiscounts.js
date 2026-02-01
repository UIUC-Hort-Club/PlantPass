import { API_URL } from "../config";

/**
 * Retrieves all discounts from the backend.
 *
 * @returns {Array} Array of discount objects with structure:
 * [
 *   {
 *     "name": "Student Discount",
 *     "type": "percent",
 *     "value": 10.0
 *   },
 *   {
 *     "name": "Senior Discount", 
 *     "type": "dollar",
 *     "value": 5.0
 *   }
 * ]
 * 
 * Note: 
 * - For percent type: value represents percentage off (e.g., 10.0 = 10% off)
 * - For dollar type: value represents dollar amount off (e.g., 5.0 = $5.00 off)
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