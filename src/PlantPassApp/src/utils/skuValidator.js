export const validateSKUs = (rows) => {
  const skuCounts = {};
  const errors = [];
  
  rows.forEach((row, index) => {
    if (!row.sku.trim()) {
      errors.push(`Row ${index + 1}: SKU is required`);
      return;
    }
    
    // Check if SKU contains only alphanumeric characters (uppercase)
    if (!/^[A-Z0-9]+$/.test(row.sku)) {
      errors.push(`Row ${index + 1}: SKU must contain only uppercase letters and numbers`);
    }
    
    skuCounts[row.sku] = (skuCounts[row.sku] || 0) + 1;
  });
  
  // Check for duplicates
  Object.entries(skuCounts).forEach(([sku, count]) => {
    if (count > 1) {
      errors.push(`Please fix duplicate SKUs: "${sku}" is used ${count} times`);
    }
  });
  
  return errors;
};