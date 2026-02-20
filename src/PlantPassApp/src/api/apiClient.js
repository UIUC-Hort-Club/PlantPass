import { API_URL } from './config';

export async function apiRequest(endpoint, options = {}) {
  const { method = 'GET', body, headers = {}, ...rest } = options;
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      ...(body && { body: JSON.stringify(body) }),
      ...rest
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}: ${errorBody.message || 'Unknown error'}`);
    }

    if (response.status === 204) {
      return true;
    }

    return response.json();
  } catch (err) {
    console.error(`API request failed: ${method} ${endpoint}`, err);
    throw err;
  }
}
