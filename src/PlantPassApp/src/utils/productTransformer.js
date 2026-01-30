export const transformProductsData = (productsData) => {
  return productsData.map(product => ({
    SKU: product.SKU,
    Name: product.item,
    Price: product.price_ea
  }));
};

export const initializeProductQuantities = (products) => {
  const initialQuantities = {};
  const initialSubtotals = {};
  
  products.forEach((item) => {
    initialQuantities[item.SKU] = "";
    initialSubtotals[item.SKU] = "0.00";
  });
  
  return { initialQuantities, initialSubtotals };
};