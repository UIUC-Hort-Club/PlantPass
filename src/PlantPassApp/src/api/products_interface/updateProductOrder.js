import { API_URL } from "../config";

/**
 * Updates the sort order of multiple products in bulk.
 *
 * @param {Array} products - Array of products with their new sort orders:
 * [
 *   {
 *     "SKU": "BE001",
 *     "sort_order": 1
 *   },
 *   {
 *     "SKU": "BE002", 
 *     "sort_order": 2
 *   }
 * ]
 *
 * @returns {Promise} Promise that resolves when all updates are complete
 */
export async function updateProductOrder(products) {
  try {
    // Update each product's sort order
    const updatePromises = products.map(product => 
      fetch(`${API_URL}/products/${encodeURIComponent(product.SKU)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort_order: product.sort_order }),
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
    console.error("Error updating product order:", err);
    throw err;
  }
}