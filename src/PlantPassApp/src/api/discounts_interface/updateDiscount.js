import { API_URL } from "../config";

/**
 * Updates an existing discount in the backend.
 *
 * @param {string} name - The name of the discount to update
 * @param {object} updateData - Fields to update:
 * {
 *   "percent_off": 15.0
 * }
 *
 * @returns {object} The updated discount object from backend
 */
export async function updateDiscount(name, updateData) {
  if (!name) throw new Error("Discount name is required");

  try {
    const response = await fetch(`${API_URL}/discounts/${encodeURIComponent(name)}`, {
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
    return data.discount; // Return only the discount object
  } catch (err) {
    console.error("Error updating discount:", err);
    throw err;
  }
}