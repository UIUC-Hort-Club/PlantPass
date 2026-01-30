import { API_URL } from "../config";

/**
 * Fetches sales analytics from the backend.
 *
 * @returns {object} Analytics data computed by the backend.
 */
export async function fetchSalesAnalytics() {
  try {
    const response = await fetch(`${API_URL}/transactions/sales-analytics`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        `HTTP ${response.status}: ${errorBody.message || "Unknown error"}`,
      );
    }

    const analytics = await response.json();
    return analytics;
  } catch (err) {
    console.error("Error fetching sales analytics:", err);
    throw err;
  }
}
