import { apiRequest } from '../apiClient';
import type { LockState } from '../../types';

export async function setLockState(resourceType: string, isLocked: boolean): Promise<LockState> {
  return apiRequest<LockState>(`/lock/${resourceType}`, {
    method: 'PUT',
    body: { isLocked }
  });
}
