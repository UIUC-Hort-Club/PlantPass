import { apiRequest } from "../apiClient";

export async function setFeatureToggles(features) {
  try {
    return await apiRequest("/feature-toggles", {
      method: "PUT",
      body: features
    });
  } catch (error) {
    console.error("Error setting feature toggles:", error);
    throw error;
  }
}
