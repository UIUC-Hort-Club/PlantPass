import React, { useState, useEffect } from 'react';
import {
  Container,
  Button,
  Typography,
  Snackbar,
  Alert,
  Stack,
  Box,
  TextField,
} from '@mui/material';
import { InputAdornment } from '@mui/material';
import ItemsTable from './SubComponents/ItemsTable';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import Receipt from './SubComponents/Receipt';
import Scanner from './SubComponents/Scanner';
import { writeTransaction } from '../../api/writeTransaction';

function OrderEntry({ product_listings }) {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [subtotals, setSubtotals] = useState({});
  const [totals, setTotals] = useState({
    subtotal: 0,
    discount: 0,
    grandTotal: 0,
  });
  const [voucher, setVoucher] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [currentTransactionID, setCurrentTransactionID] = useState("");

  const handleScan = (scannedProduct) => {
    if (scannedProduct) {
      const sku = scannedProduct.SKU;

      const newQuantity = (quantities[sku] || 0) + 1;

      setQuantities((prev) => ({
        ...prev,
        [sku]: newQuantity,
      }));

      setSubtotals((prev) => ({
        ...prev,
        [sku]: (scannedProduct.Price * newQuantity).toFixed(2),
      }));
    } else {
      alert(`Internal Error: Item with SKU "${scannedProduct?.SKU}" not found, but should have been found...`);
    }
  };

  const getQuantity = (sku) => {
    return quantities[sku] || 0; // return 0 if SKU not found
  };

  const handleNewOrder = () => {
    window.location.reload();
  };

  // @Todo: Fetch the product listings from the backend instead of loading from a local JSON file, and handle errors if fetch fails (e.g. show error message and disable order entry)
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
        setVoucher(0);
      })
      .catch((err) => console.error('Error loading stock.json:', err));
  }, []);

  const handleQuantityChange = (e, sku) => {
    const item = products.find((i) => i.SKU === sku);
    const numericValue = parseFloat(e.target.value) || 0;
    const subtotal = (numericValue * item.Price).toFixed(2);

    setQuantities((prev) => ({ ...prev, [sku]: numericValue }));
    setSubtotals((prev) => ({ ...prev, [sku]: subtotal }));
  };

  const handleEnterOrder = () => {
    // Package the items+quantities and club voucher into a transaction object
    const transaction = {
      timestamp: Date.now(),
      items: Object.entries(quantities).map(([sku, quantity]) => {
        const product = products.find((p) => p.SKU === sku);
        return {
          SKU: sku,
          quantity: quantity,
        };
      }),
      voucher: voucher,
    };
    // Send object to backend via API call
    writeTransaction(transaction)
      .then((response) => {
        if (response.success) {
          setCurrentTransactionID(response.transactionId);
          setTotals({
            subtotal: response.subtotal,
            discount: response.discount,
            grandTotal: response.grandTotal,
          });
          setShowNotification(true);
        } else {
          alert('Failed to record transaction. Please try again.');
        }
      })
      .catch((error) => {
        console.error('Error recording transaction:', error);
        alert('An error occurred while recording the transaction. Please try again.');
      });
    // Response from backend will be success/failure, and if success, will include the transaction ID and totals for receipt
    // Including the discount data and club voucher (should be same as what was sent)
    // Use the returned data to populate the receipt component, and show success notification
    // The returned ID will be given to the customer as their receipt number, and used at cashier for order retrieval when they go to pay
  };

  return (
    <Container maxWidth="md">
      {/* Items Table Component */}
      <ItemsTable
        stockItems={products}
        quantities={quantities}
        subtotals={subtotals}
        onQuantityChange={handleQuantityChange}
      />

      <Box sx={{ mt: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Button
            variant="outlined"
            startIcon={<QrCodeScannerIcon />}
            onClick={() => setScannerOpen(true)}
            size="small"
          >
            Scan
          </Button>

          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              label="Voucher"
              type="number"
              size="small"
              value={voucher}
              onChange={(e) =>
                setVoucher(Math.max(0, Math.floor(Number(e.target.value) || 0)))
              }
              inputProps={{
                min: 0,
                step: 1,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography fontWeight={700}>$</Typography>
                  </InputAdornment>
                ),
              }}
              sx={{ width: 120 }}
            />

            <Button
              variant="contained"
              color="primary"
              onClick={handleEnterOrder}
              size="small"
            >
              Enter
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Receipt Component */}
      <Receipt
        totals={totals}
        transactionId={currentTransactionID}
      />

      <Stack direction="row" justifyContent="flex-end" alignItems="center" sx={{ mt: 2 }}>
        <Button variant="contained" color="success" onClick={handleNewOrder} size='small'>
          New Order
        </Button>
      </Stack>

      <div style={{height: "1rem"}}/>

      {/* Snackbar Alert Component */}
      <Snackbar
        open={showNotification}
        autoHideDuration={4000}
        onClose={() => setShowNotification(false)}
      >
        <Alert severity="success" onClose={() => setShowNotification(false)}>
          Your order has been successfully recorded.
        </Alert>
      </Snackbar>

      {/* Scanner Component */}
      <Scanner
        opened={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScan}
        products={products}
        getQuantity={getQuantity}
      />
    </Container>
  );
}

export default OrderEntry;