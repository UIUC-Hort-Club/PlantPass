import { API_URL } from '../config';

/**
 * Export all transaction data as a zip file containing CSV files
 * @returns {Promise<Object>} Object with filename, content (base64), and content_type
 */
export const exportData = async () => {
  const response = await fetch(`${API_URL}/transactions/export-data`);
  
  if (!response.ok) {
    throw new Error('Export failed');
  }
  
  const data = await response.json();
  return {
    filename: data.filename,
    content: data.content,
    contentType: data.content_type
  };
};
