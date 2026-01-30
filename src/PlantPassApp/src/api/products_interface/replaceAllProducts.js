import { API_URL } from '../config';

export const replaceAllProducts = async (products) => {
  try {
    const response = await fetch(`${API_URL}/products`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(products),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error replacing products:', error);
    throw error;
  }
};