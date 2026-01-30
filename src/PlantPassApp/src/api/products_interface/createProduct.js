import { API_URL } from "../config";

/**
 * Creates a new product in the backend.
 * SKU can be provided or will be generated automatically from the item name.
 *
 * @param {object} productData - Product object with structure:
 * {
 *   "SKU": "SI001", // Optional - if not provided, will be auto-generated
 *   "item": "Six Pack",
 *   "price_ea": 12.50
 * }
 *
 * @returns {object} The created product object from backend
 */
export async function createProduct(productData) {
  try {
    const response = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        `HTTP ${response.status}: ${errorBody.message || "Unknown error"}`,
      );
    }

    const data = await response.json();
    return data.product; // Return only the product object
  } catch (err) {
    console.error("Error creating product:", err);
    throw err;
  }
}