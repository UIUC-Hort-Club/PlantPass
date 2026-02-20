import { useState, useEffect } from "react";
import {
  Container,
  Button,
  Stack,
  Box,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import ItemsTable from "./SubComponents/ItemsTable";
import DiscountsTable from "./SubComponents/DiscountsTable";
import Receipt from "./SubComponents/Receipt";
import ConfirmationDialog from "../common/ConfirmationDialog";
import { readTransaction } from "../../api/transaction_interface/readTransaction";
import { getRecentUnpaidTransactions } from "../../api/transaction_interface/getRecentUnpaidTransactions";
import { updateTransaction } from "../../api/transaction_interface/updateTransaction";
import { deleteTransaction } from "../../api/transaction_interface/deleteTransaction";
import { useNotification } from "../../contexts/NotificationContext";
import { formatOrderId } from "../../utils/orderIdFormatter";

function OrderLookup() {
  const { showSuccess } = useNotification();
  
  const [orderId, setOrderId] = useState("");
  const [products, setProducts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [subtotals, setSubtotals] = useState({});
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [receiptData, setReceiptData] = useState(null);
  const [voucher, setVoucher] = useState("");
  const [currentTransactionID, setCurrentTransactionID] = useState("");
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionLoaded, setTransactionLoaded] = useState(false);
  const [isOrderCompleted, setIsOrderCompleted] = useState(false);
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [showRecentOrders, setShowRecentOrders] = useState(true);
  const [recentOrdersLimit, setRecentOrdersLimit] = useState(() => {
    const saved = sessionStorage.getItem("recentOrdersLimit");
    return saved ? parseInt(saved, 10) : 5;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [tempLimit, setTempLimit] = useState(recentOrdersLimit);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchRecentOrders();
  }, [recentOrdersLimit]);

  const fetchRecentOrders = async () => {
    try {
      const orders = await getRecentUnpaidTransactions(recentOrdersLimit);
      setRecentOrders(orders);
    } catch (err) {
      console.error("Error fetching recent orders:", err);
    }
  };

  const handleLimitChange = () => {
    const newLimit = Math.max(0, Math.min(20, tempLimit === '' ? 0 : tempLimit));
    setRecentOrdersLimit(newLimit);
    sessionStorage.setItem("recentOrdersLimit", newLimit.toString());
    setShowSettings(false);
  };


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
    setReceiptData(null);
    setShowRecentOrders(true);
    fetchRecentOrders();
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

      loadTransaction(transaction);

    } catch (err) {
      console.error("Error looking up transaction:", err);
      setError("Transaction not found!");
      setTransactionLoaded(false);
    }
  };

  const handleSelectRecentOrder = async (purchaseId) => {
    setOrderId(purchaseId);
    setError("");
    setTransactionLoaded(false);

    try {
      const transaction = await readTransaction(purchaseId);
      
      if (!transaction) {
        setError("Transaction not found!");
        setTransactionLoaded(false);
        return;
      }

      loadTransaction(transaction);

    } catch (err) {
      console.error("Error loading transaction:", err);
      setError("Transaction not found!");
      setTransactionLoaded(false);
    }
  };

  const loadTransaction = (transaction) => {
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

    setShowRecentOrders(false);
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
      
      await fetchRecentOrders();
      
      resetToInitialState();
      
    } catch (err) {
      console.error("Error completing order:", err);
      setError("Failed to complete order. Please try again.");
    }
  };

  return (
    <Container maxWidth="md" sx={{ px: { xs: 0.5, sm: 3 } }}>
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

      {!transactionLoaded && (
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            mb: 2, 
            backgroundColor: '#f5f5f5',
            display: showRecentOrders ? 'block' : 'none'
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Box>
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                Recent Unpaid Orders
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {recentOrdersLimit === 0 
                  ? 'Display disabled. Select gear icon to configure' 
                  : `Showing ${recentOrdersLimit} most recent unpaid orders. Select gear icon to configure`}
              </Typography>
            </Box>
            <Tooltip title="Configure display count">
              <IconButton 
                size="small" 
                onClick={() => setShowSettings(!showSettings)}
              >
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          {showSettings && (
            <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                label="Show orders"
                type="text"
                size="small"
                value={tempLimit}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d+$/.test(value)) {
                    setTempLimit(value === '' ? '' : parseInt(value, 10));
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '') {
                    setTempLimit(0);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleLimitChange();
                  }
                }}
                inputProps={{ min: 0, max: 20 }}
                sx={{ width: 120 }}
              />
              <Button 
                variant="contained" 
                size="small" 
                onClick={handleLimitChange}
              >
                Apply
              </Button>
            </Box>
          )}

          {recentOrdersLimit === 0 ? null : recentOrders.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No unpaid orders found
            </Typography>
          ) : (
            <Stack spacing={1}>
              {recentOrders.map((order) => (
                <Paper
                  key={order.purchase_id}
                  elevation={1}
                  sx={{
                    p: 1.5,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: '#e3f2fd',
                      transform: 'translateX(4px)',
                    },
                  }}
                  onClick={() => handleSelectRecentOrder(order.purchase_id)}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {order.purchase_id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.items?.length || 0} item(s) • ${order.receipt?.total?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {order.timestamp ? new Date(order.timestamp * 1000).toLocaleTimeString() : ''}
                    </Typography>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      )}

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
                  onClick={() => setDeleteDialogOpen(true)}
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

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        message={`Are you sure you want to delete transaction ${currentTransactionID}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />
    </Container>
  );
}

export default OrderLookup;
