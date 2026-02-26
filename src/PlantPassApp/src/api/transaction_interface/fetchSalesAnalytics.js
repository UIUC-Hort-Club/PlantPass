import { apiRequest } from "../apiClient";

/**
 * Fetches sales analytics from the backend.
 *
 * @returns {object} Analytics data computed by the backend.
 */
export async function fetchSalesAnalytics() {
  return apiRequest('/transactions/sales-analytics');
}
