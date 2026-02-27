import { apiRequest } from "../apiClient";
import type { FeatureToggles } from "../../types";

export async function setFeatureToggles(features: FeatureToggles): Promise<FeatureToggles> {
  try {
    return await apiRequest<FeatureToggles>("/feature-toggles", {
      method: "PUT",
      body: features
    });
  } catch (error) {
    throw error;
  }
}
