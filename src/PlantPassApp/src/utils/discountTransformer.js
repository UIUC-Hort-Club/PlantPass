export const transformDiscountsForOrder = (discounts, selectedDiscountNames) => {
  return discounts.map(discount => ({
    name: discount.name,
    type: discount.type,
    value: discount.value || 0,
    selected: selectedDiscountNames.includes(discount.name)
  }));
};