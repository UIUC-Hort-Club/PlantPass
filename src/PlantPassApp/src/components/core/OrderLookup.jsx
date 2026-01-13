import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import ItemsTable from './SubComponents/ItemsTable';
import Receipt from './SubComponents/Receipt';
// import { getTransaction } from '../api/getTransaction';
// import { updateTransaction } from '../api/updateTransaction';
// import { deleteTransaction } from '../api/deleteTransaction';
// import { completeTransaction } from '../api/completeTransaction';

function OrderLookup({ product_listings }) {
  const [orderId, setOrderId] = useState('');
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [subtotals, setSubtotals] = useState({});
  const [totals, setTotals] = useState({
    subtotal: 0,
    discount: 0,
    grandTotal: 0,
  });

  const [currentTransactionID, setCurrentTransactionID] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [error, setError] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('Cash');

  /* ---------------------------------- Load product catalog ---------------------------------- */
  useEffect(() => {
    fetch(product_listings)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);

        const initialQuantities = {};
        const initialSubtotals = {};
        data.forEach((item) => {
          initialQuantities[item.SKU] = 0;
          initialSubtotals[item.SKU] = '0.00';
        });

        setQuantities(initialQuantities);
        setSubtotals(initialSubtotals);
      })
      .catch((err) => console.error('Error loading products:', err));
  }, []);

  /* ---------------------------------- Quantity editing ---------------------------------- */
  const handleQuantityChange = (e, sku) => {
    const item = products.find((i) => i.SKU === sku);
    const numericValue = parseFloat(e.target.value) || 0;
    const subtotal = (numericValue * item.Price).toFixed(2);

    setQuantities((prev) => ({ ...prev, [sku]: numericValue }));
    setSubtotals((prev) => ({ ...prev, [sku]: subtotal }));

    recalculateTotals({ ...quantities, [sku]: numericValue });
  };

  const recalculateTotals = (newQuantities) => {
    let subtotal = 0;
    let totalItems = 0;

    products.forEach((item) => {
      const qty = parseFloat(newQuantities[item.SKU]) || 0;
      subtotal += qty * item.Price;
      totalItems += qty;
    });

    setTotals({
      subtotal: subtotal.toFixed(2),
      discount: 0.0,
      grandTotal: Math.floor(subtotal).toFixed(2),
    });
  };

  /* ---------------------------------- Lookup transaction ---------------------------------- */
  const handleLookup = async () => {
    setError('');

    try {
      const data = await getTransaction(orderId);

      setCurrentTransactionID(data.transaction_id);

      const newQuantities = {};
      const newSubtotals = {};

      products.forEach((item) => {
        const found = data.items?.find((i) => i.sku === item.SKU);
        const qty = found ? found.quantity : 0;
        newQuantities[item.SKU] = qty;
        newSubtotals[item.SKU] = (qty * item.Price).toFixed(2);
      });

      setQuantities(newQuantities);
      setSubtotals(newSubtotals);
      recalculateTotals(newQuantities);
    } catch (err) {
      console.error(err);
      setError('Order not found or failed to load.');
    }
  };

  /* ---------------------------------- Update transaction ---------------------------------- */
  const handleUpdate = async () => {
    const items = products
      .map((item) => ({ sku: item.SKU, quantity: quantities[item.SKU] || 0 }))
      .filter((i) => i.quantity > 0);

    const payload = {
      delete_: false,
      transaction_id: currentTransactionID,
      quantity: items.reduce((sum, i) => sum + i.quantity, 0),
      order_total: Number(totals.grandTotal),
      items,
    };

    try {
      // await updateTransaction(payload);
      setShowNotification(true);
    } catch (err) {
      console.error(err);
      setError('Failed to update transaction.');
    }
  };

  /* ---------------------------------- Delete transaction ---------------------------------- */
  const handleDelete = async () => {
    if (!currentTransactionID) return;

    try {
      // await deleteTransaction(currentTransactionID);
      setCurrentTransactionID('');
      setQuantities({});
      setSubtotals({});
      setTotals({ subtotal: 0, discount: 0, grandTotal: 0 });
      setShowNotification(true);
    } catch (err) {
      console.error(err);
      setError('Failed to delete transaction.');
    }
  };

  /* ---------------------------------- Complete transaction ---------------------------------- */
  const handleCompleteOrder = async () => {
    if (!currentTransactionID) return;

    try {
      const payload = {
        transaction_id: currentTransactionID,
        payment_method: paymentMethod,
      };
      // await completeTransaction(payload);
      setShowNotification(true);
    } catch (err) {
      console.error(err);
      setError('Failed to complete order.');
    }
  };

  return (
    <Container maxWidth="md">
      {/* Lookup Header */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <TextField
          label="Order ID"
          size="small"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />
        <Button variant="contained" size="small" onClick={handleLookup}>
          Lookup
        </Button>
      </Stack>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Items Table */}
      <ItemsTable
        stockItems={products}
        quantities={quantities}
        subtotals={subtotals}
        onQuantityChange={handleQuantityChange}
      />

      {/* Update / Delete Buttons */}
      <Box sx={{ mt: 2 }}>
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={handleDelete}
            disabled={!currentTransactionID}
          >
            Delete
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleUpdate}
            disabled={!currentTransactionID}
          >
            Update
          </Button>
        </Stack>
      </Box>

      {/* Receipt */}
      <Receipt totals={totals} transactionId={currentTransactionID} />

      <div style={{ height: '1rem' }} />

      {/* Payment & Complete */}
      {currentTransactionID && (
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentMethod}
              label="Payment Method"
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
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
          >
            Complete Order
          </Button>
        </Box>
      )}

      <div style={{ height: '1rem' }} />

      {/* Success Snackbar */}
      <Snackbar
        open={showNotification}
        autoHideDuration={4000}
        onClose={() => setShowNotification(false)}
      >
        <Alert severity="success" onClose={() => setShowNotification(false)}>
          Action successfully completed.
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default OrderLookup;
