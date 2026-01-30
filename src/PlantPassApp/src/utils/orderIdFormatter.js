export const formatOrderId = (orderId) => {
  if (!orderId) return '';
  
  const cleanId = orderId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  if (cleanId.length <= 4) {
    return cleanId;
  }
  
  return cleanId.slice(0, 4) + '-' + cleanId.slice(4);
};