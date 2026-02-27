import { apiRequest } from "../apiClient";
import type { PaymentMethod } from "../../types";

export async function getAllPaymentMethods(): Promise<PaymentMethod[]> {
  return apiRequest<PaymentMethod[]>("/payment-methods");
}
