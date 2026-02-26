import { apiRequest } from "../apiClient";
import type { PaymentMethod } from "../../types";

export async function replaceAllPaymentMethods(paymentMethods: PaymentMethod[]): Promise<void> {
  return apiRequest<void>("/payment-methods", {
    method: "PUT",
    body: paymentMethods,
  });
}
