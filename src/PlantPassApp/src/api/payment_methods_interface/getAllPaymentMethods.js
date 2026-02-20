import { apiRequest } from "../apiClient";

export async function getAllPaymentMethods() {
  return apiRequest("/payment-methods");
}
