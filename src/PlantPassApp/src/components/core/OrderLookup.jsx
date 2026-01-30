import React, { useState, useEffect } from "react";
import {
  Container,
  Button,
  Stack,
  Box,
  Snackbar,
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
import { getAllProducts } from "../../api/products_interface/getAllProducts";
import { getAllDiscounts } from "../../api/discounts_interface/getAllDiscounts";

function OrderLookup() {
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
  const [voucher, setVoucher] = useState("");
  const [currentTransactionID, setCurrentTransactionID] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState(""); // Add specific message state
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(""); // Initialize to empty
  const [transactionLoaded, setTransactionLoaded] = useState(false);

  // Load products and discounts on component mount
  useEffect(() => {
    loadProducts();
    loadDiscounts();
  }, []);

  const loadProducts = async () => {
    try {
      const productsData = await getAllProducts();
      const transformedProducts = productsData.map(product => ({
        SKU: product.SKU,
        Name: product.item,
        Price: product.price_ea
      }));
      setProducts(transformedProducts);
      
      // Initialize quantities and subtotals
      const initialQuantities = {};
      const initialSubtotals = {};
      transformedProducts.forEach((item) => {
        initialQuantities[item.SKU] = 0;
        initialSubtotals[item.SKU] = "0.00";
      });
      setQuantities(initialQuantities);
      setSubtotals(initialSubtotals);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const loadDiscounts = async () => {
    try {
      const discountsData = await getAllDiscounts();
      setDiscounts(discountsData);
    } catch (error) {
      console.error("Error loading discounts:", error);
      setDiscounts([]);
    }
  };

  const resetToInitialState = () => {
    setCurrentTransactionID("");
    setTransactionLoaded(false);
    setOrderId("");
    setSelectedDiscounts([]);
    setVoucher("");
    setPaymentMethod(""); // Reset to empty
    setError("");
    setNotificationMessage(""); // Reset notification message
    
    // Reset quantities and subtotals
    const resetQuantities = {};
    const resetSubtotals = {};
    products.forEach((product) => {
      resetQuantities[product.SKU] = 0;
      resetSubtotals[product.SKU] = "0.00";
    });
    setQuantities(resetQuantities);
    setSubtotals(resetSubtotals);
    
    setTotals({ subtotal: 0, discount: 0, grandTotal: 0 });
  };

  const handleQuantityChange = (e, sku) => {
    const value = e.target.value;
    const item = products.find((i) => i.SKU === sku);

    // Allow empty input
    if (value === "") {
      setQuantities((prev) => ({ ...prev, [sku]: "" }));
      setSubtotals((prev) => ({ ...prev, [sku]: "0.00" }));
      return;
    }

    // Only allow whole numbers (integers)
    const numericValue = parseInt(value);
    
    // If not a valid integer or negative, ignore the input
    if (isNaN(numericValue) || numericValue < 0) {
      return;
    }

    setQuantities((prev) => ({ ...prev, [sku]: numericValue }));
    const subtotal = (numericValue * item.Price).toFixed(2);
    setSubtotals((prev) => ({ ...prev, [sku]: subtotal }));
  };

  const handleDiscountToggle = (selectedDiscountNames) => {
    setSelectedDiscounts(selectedDiscountNames);
  };

  const handleLookup = async () => {
    setError("");
    setTransactionLoaded(false); // Reset transaction loaded state
    
    if (!orderId.trim()) {
      setError("Please enter an Order ID");
      return;
    }

    try {
      const transaction = await readTransaction(orderId.trim());
      
      if (!transaction) {
        setError("Transaction not found!");
        setTransactionLoaded(false); // Ensure UI elements stay hidden
        return;
      }

      setCurrentTransactionID(transaction.purchase_id);
      setTransactionLoaded(true);

      // Populate quantities from transaction
      const newQuantities = {};
      const newSubtotals = {};
      
      // Initialize all products to 0
      products.forEach((product) => {
        newQuantities[product.SKU] = 0;
        newSubtotals[product.SKU] = "0.00";
      });

      // Set quantities from transaction items
      transaction.items?.forEach((item) => {
        newQuantities[item.SKU] = item.quantity;
        newSubtotals[item.SKU] = (item.quantity * item.price_ea).toFixed(2);
      });

      setQuantities(newQuantities);
      setSubtotals(newSubtotals);

      // Set selected discounts (those with amount_off > 0)
      const selectedDiscountNames = transaction.discounts
        ?.filter(discount => discount.amount_off > 0)
        .map(discount => discount.name) || [];
      setSelectedDiscounts(selectedDiscountNames);

      // Set voucher
      setVoucher(transaction.club_voucher || 0);

      // Set totals from receipt
      setTotals({
        subtotal: transaction.receipt?.subtotal || 0,
        discount: transaction.receipt?.discount || 0,
        grandTotal: transaction.receipt?.total || 0,
      });

      // Set payment method if already paid, otherwise keep empty
      if (transaction.payment?.method && transaction.payment?.paid) {
        setPaymentMethod(transaction.payment.method);
      } else {
        setPaymentMethod(""); // Keep empty for unpaid transactions
      }

    } catch (err) {
      console.error("Error looking up transaction:", err);
      setError("Transaction not found!");
      setTransactionLoaded(false); // Ensure UI elements stay hidden
    }
  };

  const handleUpdate = async () => {
    if (!currentTransactionID) {
      setError("No transaction loaded to update");
      return;
    }

    try {
      // Get all discounts with selection status
      const discountsWithSelection = discounts.map(discount => ({
        name: discount.name,
        type: discount.type,
        percent_off: discount.percent_off || 0,
        value_off: discount.value_off || 0,
        selected: selectedDiscounts.includes(discount.name)
      }));

      const updateData = {
        items: Object.entries(quantities)
          .filter(([sku, quantity]) => quantity && parseInt(quantity) > 0)
          .map(([sku, quantity]) => {
            const product = products.find((p) => p.SKU === sku);
            return {
              SKU: sku,
              item: product.Name,
              quantity: parseInt(quantity),
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
      
      setNotificationMessage("Transaction details successfully updated!");
      setShowNotification(true);
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
      setNotificationMessage("Transaction successfully deleted!");
      setShowNotification(true);
      
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
      setNotificationMessage(`Order ${currentTransactionID} has been completed!`);
      setShowNotification(true);
      setError("");
      
      // Reset to initial state after successful completion
      resetToInitialState();
      
    } catch (err) {
      console.error("Error completing order:", err);
      setError("Failed to complete order. Please try again.");
    }
  };

  return (
    <Container maxWidth="md">
      {/* Lookup Header - Always visible */}
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
          onChange={(e) => setOrderId(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleLookup();
            }
          }}
        />
        <Button variant="contained" size="small" onClick={handleLookup}>
          Lookup
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Only show content after transaction is loaded */}
      {transactionLoaded && (
        <>
          {/* Items Table */}
          <ItemsTable
            stockItems={products}
            quantities={quantities}
            subtotals={subtotals}
            onQuantityChange={handleQuantityChange}
          />

          {/* Discounts Table */}
          <DiscountsTable
            discounts={discounts}
            selectedDiscounts={selectedDiscounts}
            onDiscountToggle={handleDiscountToggle}
          />

          {/* Voucher */}
          <Stack direction="row" justifyContent="right" sx={{ mt: 2 }}>
            <TextField
              label="Voucher"
              type="text"
              size="small"
              value={voucher}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  setVoucher("");
                  return;
                }
                const numeric = Math.max(0, Math.floor(Number(value)));
                setVoucher(numeric);
              }}
              sx={{ width: 120 }}
            />
          </Stack>

          {/* Update / Delete Buttons */}
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

          {/* Receipt */}
          <Receipt 
            totals={totals} 
            transactionId={currentTransactionID}
            discounts={discounts.map(discount => ({
              name: discount.name,
              amount_off: selectedDiscounts.includes(discount.name) ? 
                (discount.type === "dollar" ? discount.value_off : 
                 (Number(totals.subtotal) * discount.percent_off / 100)) : 0
            }))}
            voucher={Number(voucher) || 0}
          />

          {/* Payment & Complete */}
          <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2, justifyContent: "center" }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Payment Method *</InputLabel>
              <Select
                value={paymentMethod}
                label="Payment Method *"
                onChange={(e) => setPaymentMethod(e.target.value)}
                error={!paymentMethod}
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
        </>
      )}

      <div style={{ height: "1rem" }} />

      {/* Success Snackbar */}
      <Snackbar
        open={showNotification}
        autoHideDuration={4000}
        onClose={() => setShowNotification(false)}
      >
        <Alert severity="success" onClose={() => setShowNotification(false)}>
          {notificationMessage || "Action completed successfully."}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default OrderLookup;
