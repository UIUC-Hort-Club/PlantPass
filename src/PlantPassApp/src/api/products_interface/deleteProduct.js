import { API_URL } from "../config";

/**
 * Deletes a product from the backend.
 *
 * @param {string} sku - The SKU of the product to delete
 * @returns {void}
 */
export async function deleteProduct(sku) {
  if (!sku) throw new Error("Product SKU is required");

  try {
    const response = await fetch(`${API_URL}/products/${encodeURIComponent(sku)}`, {
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
    console.error("Error deleting product:", err);
    throw err;
  }
}