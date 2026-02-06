import { API_URL } from '../config';

/**
 * Export all transaction data
 * @returns {Promise<Object>} The exported data
 */
export const exportData = async () => {
  const response = await fetch(`${API_URL}/transactions/export-data`);
  
  if (!response.ok) {
    throw new Error('Export failed');
  }
  
  const data = await response.json();
  return data.export_data;
};
