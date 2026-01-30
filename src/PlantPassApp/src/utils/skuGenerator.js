const findNextAvailableNumber = (prefix, existingProducts) => {
  const existingSKUs = existingProducts
    .map(product => product.sku)
    .filter(sku => sku && sku.startsWith(prefix) && sku.length === 5);
  
  const numbers = existingSKUs
    .map(sku => parseInt(sku.slice(2)))
    .filter(num => !isNaN(num));
  
  let nextNum = 1;
  while (numbers.includes(nextNum)) {
    nextNum++;
  }
  
  return `${prefix}${nextNum.toString().padStart(3, '0')}`;
};

export const generateSKU = (itemName, existingProducts) => {
  const prefix = itemName.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase();
  
  if (prefix.length < 2) {
    const paddedPrefix = (prefix + 'XX').slice(0, 2);
    return findNextAvailableNumber(paddedPrefix, existingProducts);
  }
  
  return findNextAvailableNumber(prefix, existingProducts);
};