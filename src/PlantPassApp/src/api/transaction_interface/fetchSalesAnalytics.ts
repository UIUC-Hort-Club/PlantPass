import { apiRequest } from "../apiClient";
import type { SalesAnalytics } from "../../types";

/**
 * Fetches sales analytics from the backend.
 *
 * @returns Analytics data computed by the backend.
 */
export async function fetchSalesAnalytics(): Promise<SalesAnalytics> {
  return apiRequest<SalesAnalytics>('/transactions/sales-analytics');
}
