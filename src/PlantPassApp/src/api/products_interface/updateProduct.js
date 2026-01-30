import { API_URL } from "../config";

/**
 * Updates an existing product in the backend.
 *
 * @param {string} sku - The SKU of the product to update
 * @param {object} updateData - Fields to update:
 * {
 *   "SKU": "SI001", // Optional - if provided, will change the SKU
 *   "item": "updated six pack name",
 *   "price_ea": 15.00
 * }
 *
 * @returns {object} The updated product object from backend
 */
export async function updateProduct(sku, updateData) {
  if (!sku) throw new Error("Product SKU is required");

  try {
    const response = await fetch(`${API_URL}/products/${encodeURIComponent(sku)}`, {
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
    return data.product; // Return only the product object
  } catch (err) {
    console.error("Error updating product:", err);
    throw err;
  }
}