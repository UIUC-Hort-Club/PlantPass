import { API_URL } from '../config';

export const replaceAllDiscounts = async (discounts) => {
  try {
    const response = await fetch(`${API_URL}/discounts`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discounts),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error replacing discounts:', error);
    throw error;
  }
};