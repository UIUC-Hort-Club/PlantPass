import { API_URL } from "../config";

/**
 * Updates the sort order of multiple discounts in bulk.
 *
 * @param {Array} discounts - Array of discounts with their new sort orders:
 * [
 *   {
 *     "name": "Holiday Sale",
 *     "sort_order": 1
 *   },
 *   {
 *     "name": "VIP Discount", 
 *     "sort_order": 2
 *   }
 * ]
 *
 * @returns {Promise} Promise that resolves when all updates are complete
 */
export async function updateDiscountOrder(discounts) {
  try {
    // Update each discount's sort order
    const updatePromises = discounts.map(discount => 
      fetch(`${API_URL}/discounts/${encodeURIComponent(discount.name)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort_order: discount.sort_order }),
      })
    );

    const responses = await Promise.all(updatePromises);
    
    // Check if all requests were successful
    for (const response of responses) {
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(
          `HTTP ${response.status}: ${errorBody.message || "Unknown error"}`,
        );
      }
    }

    return true;
  } catch (err) {
    console.error("Error updating discount order:", err);
    throw err;
  }
}