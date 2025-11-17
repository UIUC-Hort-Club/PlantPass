import React, { useState, useEffect } from 'react';
import {
  Container,
  Button,
  Typography,
  Snackbar,
  Alert,
  Stack,
  Box,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import ItemsTable from './OrderEntrySubComponents/ItemsTable';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import Receipt from './OrderEntrySubComponents/Receipt';
import Scanner from './Scanner';

function OrderEntry({ api, product_listings }) {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [subtotals, setSubtotals] = useState({});
  const [totals, setTotals] = useState({
    subtotal: 0,
    discount: 0,
    grandTotal: 0,
  });
  const [showNotification, setShowNotification] = useState(false);
  const [overwrite, setOverwrite] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleScan = (scannedProduct) => {
    if (scannedProduct) {
      const sku = scannedProduct.SKU;

      setQuantities((prev) => ({
        ...prev,
        [sku]: overwrite ? 1 : (prev[sku] || 0) + 1,
      }));

      setSubtotals((prev) => ({
        ...prev,
        [sku]: (
          scannedProduct.Price *
          (overwrite ? 1 : ((quantities[sku] || 0) + 1))
        ).toFixed(2),
      }));
    } else {
      alert(`Internal Error: Item with SKU "${scannedProduct?.SKU}" not found, but should have been found...`);
    }
  };

  const getQuantity = (sku) => {
    return quantities[sku] || 0; // return 0 if SKU not found
  };


  const handleNewOrder = () => {
    window.location.reload(); // simple refresh for now
  };

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
      .catch((err) => console.error('Error loading stock.json:', err));
  }, []);

  const handleQuantityChange = (e, sku) => {
    const item = products.find((i) => i.SKU === sku);
    const numericValue = parseFloat(e.target.value) || 0;
    const subtotal = (numericValue * item.Price).toFixed(2);

    setQuantities((prev) => ({ ...prev, [sku]: numericValue }));
    setSubtotals((prev) => ({ ...prev, [sku]: subtotal }));
  };

  const calculateTotal = () => {
    let subtotal = 0;
    let totalItems = 0;

    products.forEach((item) => {
      const qty = parseFloat(quantities[item.SKU]) || 0;
      subtotal += qty * item.Price;
      totalItems += qty;
    });

    const grandTotal = subtotal;

    setTotals({
      subtotal: subtotal.toFixed(2),
      discount: 0.00,
      grandTotal: Math.floor(grandTotal).toFixed(2),
    });

    const postData = {
      delete_: false,
      transaction_id: uuidv4(),
      timestamp: new Date().toISOString(),
      quantity: totalItems,
      order_total: Math.floor(grandTotal),
    };

    fetch(api, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    })
      .then(() => {
        console.log('Data sent successfully:', postData);
        setShowNotification(true);
      })
      .catch((error) => {
        console.error('Error sending data:', error);
      });
  };

  // const handleNewOrder = () => {
  //   const resetQuantities = {};
  //   const resetSubtotals = {};
  //   stockItems.forEach((item) => {
  //     resetQuantities[item.SKU] = 0;
  //     resetSubtotals[item.SKU] = '0.00';
  //   });
  //   setQuantities(resetQuantities);
  //   setSubtotals(resetSubtotals);
  //   setTotals({
  //     subtotal: 0,
  //     discount: 0,
  //     grandTotal: 0,
  //   });
  // };

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
            size='small'
          >
            Scan
          </Button>

          <Stack direction="row" spacing={2} alignItems="center">
            <FormControlLabel
              control={
                <Checkbox
                  checked={overwrite}
                  onChange={(e) => setOverwrite(e.target.checked)}
                  sx={{ color: 'red' }}
                />
              }
              label="Overwrite Prev"
              sx={{ color: 'red' }}
              size='small'
            />
            <Button variant="contained" color="primary" onClick={calculateTotal} size='small'>
              Enter
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Receipt Component */}
      <Receipt totals={totals} />

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
        overwrite={overwrite}
      />
    </Container>
  );
}

export default OrderEntry;