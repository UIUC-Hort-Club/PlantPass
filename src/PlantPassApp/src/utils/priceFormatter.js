export const formatPriceInput = (value) => {
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
  
  return cleaned;
};

export const formatPriceDisplay = (value) => {
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return '0.00';
  return numValue.toFixed(2);
};

export const handlePriceBlur = (value) => {
  const numValue = parseFloat(value);
  if (isNaN(numValue) || numValue < 0) {
    return '0.00';
  }
  return numValue.toFixed(2);
};