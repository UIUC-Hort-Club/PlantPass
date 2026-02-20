import { apiRequest } from '../apiClient';

export async function getLockState(resourceType) {
  return apiRequest(`/lock/${resourceType}`, {
    method: 'GET'
  });
}
