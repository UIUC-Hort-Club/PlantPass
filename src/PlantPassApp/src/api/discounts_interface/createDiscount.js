import { API_URL } from "../config";

/**
 * Creates a new discount in the backend.
 *
 * @param {object} discountData - Discount object with structure:
 * {
 *   "name": "Student Discount",
 *   "percent_off": 10.0
 * }
 *
 * @returns {object} The created discount object from backend
 */
export async function createDiscount(discountData) {
  try {
    const response = await fetch(`${API_URL}/discounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(discountData),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        `HTTP ${response.status}: ${errorBody.message || "Unknown error"}`,
      );
    }

    const data = await response.json();
    return data.discount; // Return only the discount object
  } catch (err) {
    console.error("Error creating discount:", err);
    throw err;
  }
}