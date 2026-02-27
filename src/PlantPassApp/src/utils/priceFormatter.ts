interface FormatPriceOptions {
  onInput?: boolean;
  onBlur?: boolean;
}

export const formatPrice = (value: string | number, options: FormatPriceOptions = {}): string => {
  const { onInput = false, onBlur = false } = options;
  
  if (onBlur) {
    const numValue = parseFloat(String(value));
    if (isNaN(numValue) || numValue < 0) {
      return '0.00';
    }
    return numValue.toFixed(2);
  }
  
  if (onInput) {
    let cleaned = String(value).replace(/[^\d.]/g, '');
    
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
  }
  
  const numValue = parseFloat(String(value));
  if (isNaN(numValue)) return '0.00';
  return numValue.toFixed(2);
};

export const formatPriceInput = (value: string | number): string => formatPrice(value, { onInput: true });
export const formatPriceDisplay = (value: string | number): string => formatPrice(value);
export const handlePriceBlur = (value: string | number): string => formatPrice(value, { onBlur: true });
