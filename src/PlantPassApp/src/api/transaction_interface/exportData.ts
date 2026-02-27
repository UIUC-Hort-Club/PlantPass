import { apiRequest } from '../apiClient';

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
  const data = await apiRequest<{ filename: string; content: string; content_type: string }>(
    '/transactions/export-data'
  );
  
  return {
    filename: data.filename,
    content: data.content,
    contentType: data.content_type
  };
};
