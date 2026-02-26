import { apiRequest } from '../apiClient';
import type { LockState } from '../../types';

export async function getLockState(resourceType: string): Promise<LockState> {
  return apiRequest<LockState>(`/lock/${resourceType}`, {
    method: 'GET'
  });
}
