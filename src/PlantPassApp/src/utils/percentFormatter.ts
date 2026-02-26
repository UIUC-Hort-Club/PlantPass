export const formatPercentInput = (value: string): string => {
  let cleaned = value.replace(/[^\d.]/g, '');
  
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }
  
  if (parts.length === 2 && parts[1].length > 2) {
    cleaned = parts[0] + '.' + parts[1].substring(0, 2);
  }
  
  const numValue = parseFloat(cleaned);
  if (isNaN(numValue)) {
    return '';
  }
  
  if (numValue > 100) {
    return '100';
  }
  
  return cleaned;
};

export const formatPercentDisplay = (value: string | number): string => {
  const numValue = parseFloat(String(value));
  if (isNaN(numValue)) return '0';
  return numValue.toString();
};

export const handlePercentBlur = (value: string | number): string => {
  const numValue = parseFloat(String(value));
  if (isNaN(numValue) || numValue < 0) {
    return '0';
  }
  if (numValue > 100) {
    return '100';
  }
  return numValue.toString();
};