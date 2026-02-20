import { apiRequest } from "../apiClient";

export async function replaceAllPaymentMethods(paymentMethods) {
  return apiRequest("/payment-methods", {
    method: "PUT",
    body: paymentMethods,
  });
}
