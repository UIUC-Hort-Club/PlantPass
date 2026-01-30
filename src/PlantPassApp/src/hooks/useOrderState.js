import { useState } from 'react';

export const useOrderState = () => {
  const [products, setProducts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [subtotals, setSubtotals] = useState({});
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [totals, setTotals] = useState({
    subtotal: 0,
    discount: 0,
    grandTotal: 0,
  });
  const [voucher, setVoucher] = useState("");
  const [currentTransactionID, setCurrentTransactionID] = useState("");

  const resetOrderState = () => {
    setSelectedDiscounts([]);
    setCurrentTransactionID("");
    setTotals({
      subtotal: 0,
      discount: 0,
      grandTotal: 0,
    });
    setVoucher("");
  };

  return {
    products,
    setProducts,
    discounts,
    setDiscounts,
    quantities,
    setQuantities,
    subtotals,
    setSubtotals,
    selectedDiscounts,
    setSelectedDiscounts,
    totals,
    setTotals,
    voucher,
    setVoucher,
    currentTransactionID,
    setCurrentTransactionID,
    resetOrderState,
  };
};