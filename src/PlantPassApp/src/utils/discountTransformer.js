export const transformDiscountsForOrder = (discounts, selectedDiscountNames) => {
  return discounts.map(discount => ({
    name: discount.name,
    type: discount.type,
    percent: discount.percent,
    value: discount.value,
    selected: selectedDiscountNames.includes(discount.name)
  }));
};