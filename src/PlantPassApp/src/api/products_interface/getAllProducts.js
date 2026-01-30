import { API_URL } from "../config";

/**
 * Retrieves all products from the backend.
 *
 * @returns {Array} Array of product objects with structure:
 * [
 *   {
 *     "SKU": "SI001",
 *     "item": "Six Pack",
 *     "price_ea": 12.50
 *   }
 * ]
 */
export async function getAllProducts() {
  try {
    const response = await fetch(`${API_URL}/products`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        `HTTP ${response.status}: ${errorBody.message || "Unknown error"}`,
      );
    }

    const products = await response.json();
    return products;
  } catch (err) {
    console.error("Error retrieving products:", err);
    throw err;
  }
}