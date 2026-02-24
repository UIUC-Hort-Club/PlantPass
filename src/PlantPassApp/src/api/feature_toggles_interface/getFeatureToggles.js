import { apiRequest } from "../apiClient";

export async function getFeatureToggles() {
  try {
    return await apiRequest("/feature-toggles");
  } catch (error) {
    console.error("Error fetching feature toggles:", error);
    throw error;
  }
}
