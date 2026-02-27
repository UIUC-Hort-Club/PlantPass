import type { Discount, DiscountWithSelection } from '../types';

export const transformDiscountsForOrder = (
  discounts: Discount[],
  selectedDiscountNames: string[]
): DiscountWithSelection[] => {
  return discounts.map(discount => ({
    name: discount.name,
    type: discount.type,
    value: discount.value || 0,
    selected: selectedDiscountNames.includes(discount.name)
  }));
};