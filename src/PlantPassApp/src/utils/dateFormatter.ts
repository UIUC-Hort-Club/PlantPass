export const formatTimestamp = (timestamp: number | undefined): string => {
  if (!timestamp) return "N/A";
  return new Date(timestamp * 1000).toLocaleString();
};

export const formatDate = (date: string | number | Date | undefined): string => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString();
};

export const formatTime = (date: string | number | Date | undefined): string => {
  if (!date) return "N/A";
  return new Date(date).toLocaleTimeString();
};