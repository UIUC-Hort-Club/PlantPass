import { API_URL } from '../config';

interface ExportDataResponse {
  filename: string;
  content: string;
  contentType: string;
}

/**
 * Export all transaction data as a zip file containing CSV files
 * @returns Object with filename, content (base64), and content_type
 */
export const exportData = async (): Promise<ExportDataResponse> => {
  const response = await fetch(`${API_URL}/transactions/export-data`);
  
  if (!response.ok) {
    throw new Error('Export failed');
  }
  
  const data = await response.json() as { filename: string; content: string; content_type: string };
  return {
    filename: data.filename,
    content: data.content,
    contentType: data.content_type
  };
};
