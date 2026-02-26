import { apiRequest } from "../apiClient";
import type { FeatureToggles } from "../../types";

export async function getFeatureToggles(): Promise<FeatureToggles> {
  try {
    return await apiRequest<FeatureToggles>("/feature-toggles");
  } catch (error) {
    console.error("Error fetching feature toggles:", error);
    throw error;
  }
}
