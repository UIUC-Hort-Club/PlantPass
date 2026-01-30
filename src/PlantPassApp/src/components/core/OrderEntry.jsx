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
  CircularProgress,
} from "@mui/material";
import { InputAdornment } from "@mui/material";
import ItemsTable from "./SubComponents/ItemsTable";
import DiscountsTable from "./SubComponents/DiscountsTable";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import Receipt from "./SubComponents/Receipt";
import Scanner from "./SubComponents/Scanner";
import { createTransaction } from "../../api/transaction_interface/createTransaction";
import { getAllProducts } from "../../api/products_interface/getAllProducts";
import { getAllDiscounts } from "../../api/discounts_interface/getAllDiscounts";
import ShowTransactionID from "./SubComponents/ShowTransactionID";

function OrderEntry({ product_listings }) {
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
  const [showNotification, setShowNotification] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [currentTransactionID, setCurrentTransactionID] = useState("");
  const [transactionIDDialogOpen, setTransactionIDDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Compute subtotal safely
  const computedSubtotal = Object.values(subtotals)
    .reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
    .toFixed(2);

  const handleScan = (scannedProduct) => {
    if (scannedProduct) {
      const sku = scannedProduct.SKU;
      const currentQuantity = parseInt(quantities[sku]) || 0;
      const newQuantity = currentQuantity + 1; // Always increment by 1 (whole number)

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
    loadProducts(); // Reload products from database
    loadDiscounts(); // Reload discounts from database
    setCurrentTransactionID("");
    setTransactionIDDialogOpen(false);
    setSelectedDiscounts([]);
    setTotals({
      subtotal: 0,
      discount: 0,
      grandTotal: 0,
    });
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await getAllProducts();
      
      // Transform API data to match expected format
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
        initialQuantities[item.SKU] = "";
        initialSubtotals[item.SKU] = "0.00";
      });
      setQuantities(initialQuantities);
      setSubtotals(initialSubtotals);
      setVoucher("");
    } catch (error) {
      console.error("Error loading products from database:", error);
      // Fallback to static file if API fails
      try {
        const response = await fetch(product_listings);
        const data = await response.json();
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
      } catch (fallbackError) {
        console.error("Error loading fallback products:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadDiscounts = async () => {
    try {
      const discountsData = await getAllDiscounts();
      setDiscounts(discountsData);
    } catch (error) {
      console.error("Error loading discounts from database:", error);
      setDiscounts([]); // Set empty array on error
    }
  };

  useEffect(() => {
    loadProducts();
    loadDiscounts();
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

  const handleEnterOrder = () => {
    // Get selected discount objects
    const selectedDiscountObjects = discounts.filter(discount => 
      selectedDiscounts.includes(discount.name)
    );

    const transaction = {
      timestamp: Date.now(),
      items: Object.entries(quantities).map(([sku, quantity]) => {
        const product = products.find((p) => p.SKU === sku);
        return {
          SKU: sku,
          item: product.Name,
          quantity: parseInt(quantity) || 0, // Ensure integer quantity
          price_ea: product.Price,
        };
      }),
      discounts: selectedDiscountObjects.map(discount => ({
        name: discount.name,
        percent_off: discount.percent_off
      })),
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

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: '300px',
            gap: 2
          }}
        >
          <CircularProgress />
          <Typography>Loading products...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <ItemsTable
        stockItems={products}
        quantities={quantities}
        subtotals={subtotals}
        onQuantityChange={handleQuantityChange}
      />

      <DiscountsTable
        discounts={discounts}
        selectedDiscounts={selectedDiscounts}
        onDiscountToggle={handleDiscountToggle}
      />

      <Box sx={{ mt: 2 }}>
        <Stack
          direction="column"
          spacing={1}
        >
          <Stack
            direction="row"
            justifyContent="right"
          >
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
          </Stack>
          <Stack
            direction="row"
            justifyContent="right"
          >
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
          </Stack>
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
