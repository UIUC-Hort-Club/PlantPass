import { apiRequest } from '../apiClient';

export async function setLockState(resourceType, isLocked) {
  return apiRequest(`/lock/${resourceType}`, {
    method: 'PUT',
    body: { isLocked }
  });
}
