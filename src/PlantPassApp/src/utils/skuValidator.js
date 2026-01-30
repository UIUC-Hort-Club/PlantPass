export const validateSKUs = (rows) => {
  const skuCounts = {};
  const errors = [];
  
  rows.forEach((row, index) => {
    if (!row.sku.trim()) {
      errors.push(`Row ${index + 1}: SKU is required`);
      return;
    }
    
    if (row.sku.length !== 5) {
      errors.push(`Row ${index + 1}: SKU must be exactly 5 characters`);
    }
    
    if (!/^[A-Z]{2}\d{3}$/.test(row.sku)) {
      errors.push(`Row ${index + 1}: SKU must be 2 letters followed by 3 numbers (e.g., AB123)`);
    }
    
    skuCounts[row.sku] = (skuCounts[row.sku] || 0) + 1;
  });
  
  Object.entries(skuCounts).forEach(([sku, count]) => {
    if (count > 1) {
      errors.push(`SKU "${sku}" is used ${count} times - SKUs must be unique`);
    }
  });
  
  return errors;
};