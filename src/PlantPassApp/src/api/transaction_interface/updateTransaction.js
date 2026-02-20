import { apiRequest } from '../apiClient';

export async function updateTransaction(transactionId, updateData) {
  if (!transactionId) throw new Error("transactionId is required");
  
  const data = await apiRequest(`/transactions/${transactionId}`, {
    method: 'PUT',
    body: updateData
  });
  return data.transaction;
}
