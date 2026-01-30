export const formatTimestamp = (timestamp) => {
  if (!timestamp) return "N/A";
  return new Date(timestamp * 1000).toLocaleString();
};

export const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString();
};

export const formatTime = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleTimeString();
};