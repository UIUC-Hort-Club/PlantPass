import { useState, useEffect } from "react";
import {
  Container,
  Button,
  Stack,
  Box,
  Alert,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ItemsTable from "./SubComponents/ItemsTable";
import DiscountsTable from "./SubComponents/DiscountsTable";
import Receipt from "./SubComponents/Receipt";
import { readTransaction } from "../../api/transaction_interface/readTransaction";
import { updateTransaction } from "../../api/transaction_interface/updateTransaction";
import { deleteTransaction } from "../../api/transaction_interface/deleteTransaction";
import { useNotification } from "../../contexts/NotificationContext";
import { formatOrderId } from "../../utils/orderIdFormatter";

function OrderLookup() {
  const { showSuccess, showError } = useNotification();
  
  const [orderId, setOrderId] = useState("");
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
  const [receiptData, setReceiptData] = useState(null);
  const [voucher, setVoucher] = useState("");
  const [currentTransactionID, setCurrentTransactionID] = useState("");
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(""); // Initialize to empty
  const [transactionLoaded, setTransactionLoaded] = useState(false);
  const [isOrderCompleted, setIsOrderCompleted] = useState(false);


  const resetToInitialState = () => {
    setCurrentTransactionID("");
    setTransactionLoaded(false);
    setIsOrderCompleted(false);
    setProducts([]);
    setDiscounts([]);
    setQuantities({});
    setSubtotals({});
    setSelectedDiscounts([]);
    setVoucher("");
    setPaymentMethod("");
    setOrderId("");
    setError("");
    setTotals({
      subtotal: 0,
      discount: 0,
      grandTotal: 0,
    });
    setReceiptData(null);
  };

  const handleOrderIdChange = (e) => {
    const formattedValue = formatOrderId(e.target.value);
    setOrderId(formattedValue);
  };

  const handleQuantityChange = (e, sku) => {
    if (isOrderCompleted) return;
    
    const value = e.target.value;
    const item = products.find((i) => i.SKU === sku);

    if (value === "") {
      setQuantities((prev) => ({ ...prev, [sku]: "" }));
      setSubtotals((prev) => ({ ...prev, [sku]: "0.00" }));
      return;
    }

    const numericValue = parseInt(value);
    
    if (isNaN(numericValue) || numericValue < 0) {
      return;
    }

    setQuantities((prev) => ({ ...prev, [sku]: numericValue }));
    const subtotal = (numericValue * item.Price).toFixed(2);
    setSubtotals((prev) => ({ ...prev, [sku]: subtotal }));
  };

  const handleDiscountToggle = (selectedDiscountNames) => {
    if (isOrderCompleted) return;
    setSelectedDiscounts(selectedDiscountNames);
  };

  const handleLookup = async () => {
    setError("");
    setTransactionLoaded(false);
    if (!orderId.trim()) {
      setError("Please enter an Order ID");
      return;
    }

    try {
      const transaction = await readTransaction(orderId.trim());
      
      if (!transaction) {
        setError("Transaction not found!");
        setTransactionLoaded(false);
        return;
      }

      setCurrentTransactionID(transaction.purchase_id);
      setTransactionLoaded(true);

      const transactionProducts = transaction.items?.map(item => ({
        SKU: item.SKU,
        Name: item.item,
        Price: item.price_ea
      })) || [];
      setProducts(transactionProducts);

      const transactionDiscounts = transaction.discounts?.map(discount => ({
        name: discount.name,
        type: discount.type,
        value: discount.value
      })) || [];
      setDiscounts(transactionDiscounts);

      const newQuantities = {};
      const newSubtotals = {};
      
      transaction.items?.forEach((item) => {
        newQuantities[item.SKU] = item.quantity;
        newSubtotals[item.SKU] = (item.quantity * item.price_ea).toFixed(2);
      });

      setQuantities(newQuantities);
      setSubtotals(newSubtotals);

      const selectedDiscountNames = transaction.discounts
        ?.filter(discount => discount.amount_off > 0)
        .map(discount => discount.name) || [];
      setSelectedDiscounts(selectedDiscountNames);

      setVoucher(transaction.club_voucher || 0);

      setTotals({
        subtotal: transaction.receipt?.subtotal || 0,
        discount: transaction.receipt?.discount || 0,
        grandTotal: transaction.receipt?.total || 0,
      });

      setReceiptData({
        totals: {
          subtotal: transaction.receipt.subtotal,
          discount: transaction.receipt.discount,
          grandTotal: transaction.receipt.total,
        },
        discounts: transaction.discounts || [],
        voucher: transaction.club_voucher || 0
      });

      const orderCompleted = transaction.payment?.method && transaction.payment?.paid;
      setIsOrderCompleted(orderCompleted);

      if (transaction.payment?.method && transaction.payment?.paid) {
        setPaymentMethod(transaction.payment.method);
      } else {
        setPaymentMethod("");
      }

    } catch (err) {
      console.error("Error looking up transaction:", err);
      setError("Transaction not found!");
      setTransactionLoaded(false);
    }
  };

  const handleUpdate = async () => {
    if (!currentTransactionID) {
      setError("No transaction loaded to update");
      return;
    }

    try {
      const discountsWithSelection = discounts.map(discount => ({
        name: discount.name,
        type: discount.type,
        value: discount.value || 0,
        selected: selectedDiscounts.includes(discount.name)
      }));

      const updateData = {
        items: Object.entries(quantities)
          .map(([sku, quantity]) => {
            const product = products.find((p) => p.SKU === sku);
            return {
              SKU: sku,
              item: product.Name,
              quantity: parseInt(quantity) || 0,
              price_ea: product.Price,
            };
          }),
        discounts: discountsWithSelection,
        voucher: Number(voucher) || 0,
      };

      const updatedTransaction = await updateTransaction(currentTransactionID, updateData);
      
      setTotals({
        subtotal: updatedTransaction.receipt.subtotal,
        discount: updatedTransaction.receipt.discount,
        grandTotal: updatedTransaction.receipt.total,
      });
      setReceiptData({
        totals: {
          subtotal: updatedTransaction.receipt.subtotal,
          discount: updatedTransaction.receipt.discount,
          grandTotal: updatedTransaction.receipt.total,
        },
        discounts: updatedTransaction.discounts || [],
        voucher: updatedTransaction.club_voucher || 0
      });
      showSuccess(`Order ${currentTransactionID} has been updated!`);
      setError("");
      
    } catch (err) {
      console.error("Error updating transaction:", err);
      setError("Failed to update transaction. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!currentTransactionID) {
      setError("No transaction loaded to delete");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this transaction? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteTransaction(currentTransactionID);
      resetToInitialState();
      showSuccess("Transaction successfully deleted!");
      
    } catch (err) {
      console.error("Error deleting transaction:", err);
      setError("Failed to delete transaction. Please try again.");
    }
  };

  const handleCompleteOrder = async () => {
    if (!currentTransactionID) {
      setError("No transaction loaded to complete");
      return;
    }

    if (!paymentMethod) {
      setError("Please select a payment method before completing the order");
      return;
    }

    try {
      const paymentData = {
        payment: {
          method: paymentMethod,
          paid: true
        }
      };

      await updateTransaction(currentTransactionID, paymentData);
      showSuccess(`Order ${currentTransactionID} has been completed!`);
      setError("");
      
      resetToInitialState();
      
    } catch (err) {
      console.error("Error completing order:", err);
      setError("Failed to complete order. Please try again.");
    }
  };

  return (
    <Container maxWidth="md">
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="right"
        sx={{ mb: 2 }}
      >
        <TextField
          label="Order ID"
          size="small"
          value={orderId}
          onChange={handleOrderIdChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleLookup();
            }
          }}
          inputProps={{
            maxLength: 7,
            style: { textTransform: 'uppercase' }
          }}
        />
        <Button variant="contained" size="small" onClick={handleLookup}>
          Lookup
        </Button>
        <Button variant="contained" size="small" onClick={resetToInitialState}>
          Reset
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {transactionLoaded && isOrderCompleted && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>Order Completed:</strong> This order has been marked as completed and is now view-only.
        </Alert>
      )}

      {transactionLoaded && (
        <>
          <ItemsTable
            stockItems={products}
            quantities={quantities}
            subtotals={subtotals}
            onQuantityChange={handleQuantityChange}
            readOnly={isOrderCompleted}
          />

          <DiscountsTable
            discounts={discounts}
            selectedDiscounts={selectedDiscounts}
            onDiscountToggle={handleDiscountToggle}
            readOnly={isOrderCompleted}
          />

          <Stack direction="row" justifyContent="right" sx={{ mt: 2 }}>
            <TextField
              label="Voucher"
              type="text"
              size="small"
              value={voucher}
              onChange={(e) => {
                if (isOrderCompleted) return;
                const value = e.target.value;
                if (value === "") {
                  setVoucher("");
                  return;
                }
                const numeric = Math.max(0, Math.floor(Number(value)));
                setVoucher(numeric);
              }}
              sx={{ width: 120 }}
              disabled={isOrderCompleted}
            />
          </Stack>

          {!isOrderCompleted && (
            <Box sx={{ mt: 2 }}>
              <Stack direction="row" spacing={2} justifyContent="space-between">
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={handleDelete}
                >
                  Delete Order
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={handleUpdate}
                >
                  Update Order
                </Button>
              </Stack>
            </Box>
          )}

          {receiptData && (
            <Receipt 
              totals={receiptData.totals} 
              transactionId={currentTransactionID}
              discounts={receiptData.discounts}
              voucher={receiptData.voucher}
            />
          )}

          {!isOrderCompleted && (
            <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2, justifyContent: "center"}}>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Payment Method *</InputLabel>
                <Select
                  value={paymentMethod}
                  label="Payment Method *"
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Select Payment Method</em>
                  </MenuItem>
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="Credit/Debit">Credit/Debit</MenuItem>
                  <MenuItem value="Check">Check</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={handleCompleteOrder}
                disabled={!paymentMethod}
              >
                Complete Order
              </Button>
            </Box>
          )}

          {isOrderCompleted && paymentMethod && (
            <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
              <Alert severity="success" sx={{ display: "inline-flex" }}>
                <strong>Payment Method:</strong> {paymentMethod}
              </Alert>
            </Box>
          )}
        </>
      )}

      <div style={{ height: "1rem" }} />
    </Container>
  );
}

export default OrderLookup;
