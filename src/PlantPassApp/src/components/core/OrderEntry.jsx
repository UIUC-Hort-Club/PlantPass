import React, { useState, useEffect } from "react";
import {
  Container,
  Button,
  Typography,
  Snackbar,
  Alert,
  Stack,
  Box,
  TextField,
} from "@mui/material";
import { InputAdornment } from "@mui/material";
import ItemsTable from "./SubComponents/ItemsTable";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import Receipt from "./SubComponents/Receipt";
import Scanner from "./SubComponents/Scanner";
import { createTransaction } from "../../api/transaction_interface/createTransaction";
import ShowTransactionID from "./SubComponents/ShowTransactionID";

function OrderEntry({ product_listings }) {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [subtotals, setSubtotals] = useState({});
  const [totals, setTotals] = useState({
    subtotal: 0,
    discount: 0,
    grandTotal: 0,
  });
  const [voucher, setVoucher] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [currentTransactionID, setCurrentTransactionID] = useState("");
  const [transactionIDDialogOpen, setTransactionIDDialogOpen] = useState(false);

  // Compute subtotal safely
  const computedSubtotal = Object.values(subtotals)
    .reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
    .toFixed(2);

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
      alert(
        `Internal Error: Item with SKU "${scannedProduct?.SKU}" not found, but should have been found...`,
      );
    }
  };

  const getQuantity = (sku) => {
    return quantities[sku] || 0;
  };

  const handleNewOrder = () => {
    window.location.reload();
  };

  useEffect(() => {
    fetch(product_listings)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        const initialQuantities = {};
        const initialSubtotals = {};
        data.forEach((item) => {
          initialQuantities[item.SKU] = "";
          initialSubtotals[item.SKU] = "0.00";
        });
        setQuantities(initialQuantities);
        setSubtotals(initialSubtotals);
        setVoucher("");
      })
      .catch((err) => console.error("Error loading stock.json:", err));
  }, []);

  const handleQuantityChange = (e, sku) => {
    const value = e.target.value;
    const item = products.find((i) => i.SKU === sku);

    // Allow empty input
    if (value === "") {
      setQuantities((prev) => ({ ...prev, [sku]: "" }));
      setSubtotals((prev) => ({ ...prev, [sku]: "0.00" }));
      return;
    }

    const numericValue = parseFloat(value);

    setQuantities((prev) => ({ ...prev, [sku]: numericValue }));

    const subtotal = isNaN(numericValue)
      ? "0.00"
      : (numericValue * item.Price).toFixed(2);

    setSubtotals((prev) => ({ ...prev, [sku]: subtotal }));
  };

  const handleEnterOrder = () => {
    const transaction = {
      timestamp: Date.now(),
      items: Object.entries(quantities).map(([sku, quantity]) => {
        const product = products.find((p) => p.SKU === sku);
        return {
          SKU: sku,
          item: product.Name,
          quantity: Number(quantity) || 0,
          price_ea: product.Price,
        };
      }),
      voucher: Number(voucher) || 0,
    };

    createTransaction(transaction)
      .then((response) => {
        console.log("Transaction recorded successfully:", response);
        setCurrentTransactionID(response.purchase_id);
        setTotals({
          subtotal: response.receipt.subtotal,
          discount: response.receipt.discount,
          grandTotal: response.receipt.total,
        });
        setShowNotification(true);
        setTransactionIDDialogOpen(true);
      })
      .catch((error) => {
        console.error("Error recording transaction:", error);
        alert("An error occurred while recording the transaction...");
      });
  };

  return (
    <Container maxWidth="md">
      <ItemsTable
        stockItems={products}
        quantities={quantities}
        subtotals={subtotals}
        onQuantityChange={handleQuantityChange}
      />

      <Box sx={{ mt: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography fontWeight={700}>$</Typography>
                  </InputAdornment>
                ),
              }}
              sx={{ width: 120 }}
            />

            <TextField
              label="Subtotal"
              size="small"
              value={computedSubtotal}
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography fontWeight={700}>$</Typography>
                  </InputAdornment>
                ),
              }}
              sx={{ width: 140 }}
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

      {currentTransactionID && (
        <>
          <Receipt totals={totals} transactionId={currentTransactionID} />

          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="success"
              onClick={handleNewOrder}
              size="small"
            >
              New Order
            </Button>
          </Stack>
        </>
      )}

      <div style={{ height: "1rem" }} />

      <Snackbar
        open={showNotification}
        autoHideDuration={4000}
        onClose={() => setShowNotification(false)}
      >
        <Alert severity="success" onClose={() => setShowNotification(false)}>
          Your order has been successfully recorded.
        </Alert>
      </Snackbar>

      <Scanner
        opened={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScan}
        products={products}
        getQuantity={getQuantity}
      />

      <ShowTransactionID
        open={transactionIDDialogOpen}
        onClose={() => setTransactionIDDialogOpen(false)}
        transactionID={currentTransactionID}
      />
    </Container>
  );
}

export default OrderEntry;
