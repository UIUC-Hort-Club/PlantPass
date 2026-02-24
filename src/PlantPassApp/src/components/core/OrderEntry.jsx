import { useState, useEffect, useRef } from "react";
import {
  Container,
  Button,
  Typography,
  Stack,
  Box,
  TextField,
} from "@mui/material";
import { InputAdornment } from "@mui/material";
import ItemsTable from "./SubComponents/ItemsTable";
import DiscountsTable from "./SubComponents/DiscountsTable";
import Receipt from "./SubComponents/Receipt";
import { createTransaction } from "../../api/transaction_interface/createTransaction";
import { updateTransaction } from "../../api/transaction_interface/updateTransaction";
import { getAllProducts } from "../../api/products_interface/getAllProducts";
import { getAllDiscounts } from "../../api/discounts_interface/getAllDiscounts";
import ShowTransactionID from "./SubComponents/ShowTransactionID";
import { useNotification } from "../../contexts/NotificationContext";
import { transformProductsData, initializeProductQuantities } from "../../utils/productTransformer";
import { transformDiscountsForOrder } from "../../utils/discountTransformer";
import LoadingSpinner from "../common/LoadingSpinner";
import { useFeatureToggles } from "../../contexts/FeatureToggleContext";

function OrderEntry() {
  const { showSuccess, showWarning, showError } = useNotification();
  const { features } = useFeatureToggles();
  const receiptRef = useRef(null);
  
  const [products, setProducts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [subtotals, setSubtotals] = useState({});
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [receiptData, setReceiptData] = useState(null);
  const [voucher, setVoucher] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [currentTransactionID, setCurrentTransactionID] = useState("");
  const [transactionIDDialogOpen, setTransactionIDDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Debug: Log feature toggle state
  useEffect(() => {
    console.log("Feature Toggles:", features);
  }, [features]);

  const computedSubtotal = Object.values(subtotals)
    .reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
    .toFixed(2);

  const handleNewOrder = () => {
    loadProducts();
    loadDiscounts();
    setCurrentTransactionID("");
    setTransactionIDDialogOpen(false);
    setSelectedDiscounts([]);
    setReceiptData(null);
    setCustomerEmail("");
  };

  const handleTransactionIDClose = () => {
    setTransactionIDDialogOpen(false);
    setTimeout(() => {
      receiptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await getAllProducts();
      
      const transformedProducts = transformProductsData(productsData);
      setProducts(transformedProducts);
      
      const { initialQuantities, initialSubtotals } = initializeProductQuantities(transformedProducts);
      setQuantities(initialQuantities);
      setSubtotals(initialSubtotals);
      setVoucher("");
    } catch (error) {
      console.error("Error loading products from database:", error);
      try {
        const data = [];
        setProducts(data);
        const { initialQuantities, initialSubtotals } = initializeProductQuantities(data);
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
      showError("Failed to load discounts. Using empty discount list.");
      setDiscounts([]);
    }
  };

  useEffect(() => {
    loadProducts();
    loadDiscounts();
  }, []);

  const handleQuantityChange = (e, sku) => {
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
    setSelectedDiscounts(selectedDiscountNames);
  };

  const handleEnterOrder = () => {
    const discountsWithSelection = transformDiscountsForOrder(discounts, selectedDiscounts);

    const transaction = {
      timestamp: Math.floor(Date.now() / 1000),
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
      // If email collection is disabled, always send empty string
      email: features.collectEmailAddresses ? (customerEmail || "") : "",
    };

    if (Object.values(quantities).every(qty => !qty || parseInt(qty) === 0)) {
      showWarning("Please add items to your order before submitting.");
      return;
    }

    createTransaction(transaction)
      .then((response) => {
        setCurrentTransactionID(response.purchase_id);
        setReceiptData({
          totals: {
            subtotal: response.receipt.subtotal,
            discount: response.receipt.discount,
            grandTotal: response.receipt.total,
          },
          discounts: response.discounts || [],
          voucher: response.club_voucher || 0
        });
        showSuccess("Your order has been successfully recorded.");
        setTransactionIDDialogOpen(true);
      })
      .catch((error) => {
        console.error("Error recording transaction:", error);
        showError("An error occurred while recording the transaction. Please try again.");
      });
  };

  const handleUpdateOrder = () => {
    if (!currentTransactionID) {
      showWarning("No current transaction to update.");
      return;
    }

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

    if (Object.values(quantities).every(qty => !qty || parseInt(qty) === 0)) {
      showWarning("Please add items to your order before updating.");
      return;
    }

    updateTransaction(currentTransactionID, updateData)
      .then((response) => {
        setReceiptData({
          totals: {
            subtotal: response.receipt.subtotal,
            discount: response.receipt.discount,
            grandTotal: response.receipt.total,
          },
          discounts: response.discounts || [],
          voucher: response.club_voucher || 0
        });
        showSuccess(`Order ${currentTransactionID} has been updated!`);
      })
      .catch((error) => {
        console.error("Error updating transaction:", error);
        showError("An error occurred while updating the transaction. Please try again.");
      });
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ px: { xs: 1, sm: 3 } }}>
        <LoadingSpinner message="Loading products..." />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ px: { xs: 1, sm: 3 } }}>
      <ItemsTable
        stockItems={products}
        quantities={quantities}
        subtotals={subtotals}
        onQuantityChange={handleQuantityChange}
      />

      <Box 
        sx={{ 
          mt: 3,
          p: 2.5,
          background: "linear-gradient(135deg, #F8F9FA 0%, #E8F5E9 100%)",
          borderRadius: 3,
          border: "1px solid #E9ECEF",
        }}
      >
        <Stack
          direction="column"
          alignItems="flex-end"
          spacing={2}
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
              if (!Number.isNaN(numeric)) {
                setVoucher(numeric);
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography fontWeight={700} color="#2D6A4F">$</Typography>
                </InputAdornment>
              ),
            }}
            sx={{ 
              width: 140,
              '& .MuiOutlinedInput-root': {
                background: '#FFFFFF',
              }
            }}
          />            
          <TextField
            label="Subtotal"
            size="small"
            value={computedSubtotal}
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  <Typography fontWeight={700} color="#2D6A4F">$</Typography>
                </InputAdornment>
              ),
            }}
            sx={{ 
              width: 140,
              '& .MuiOutlinedInput-root': {
                background: '#FFFFFF',
                fontWeight: 700,
                fontSize: '1.1rem',
                color: '#2D6A4F',
              }
            }}
          />            
        </Stack>
      </Box>

      <DiscountsTable
        discounts={discounts}
        selectedDiscounts={selectedDiscounts}
        onDiscountToggle={handleDiscountToggle}
      />

      <Box sx={{ mt: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          {features.collectEmailAddresses && (
            <TextField
              label="Customer Email (Optional)"
              type="email"
              size="small"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="email@example.com"
              sx={{ width: { xs: '100%', sm: 300 } }}
              helperText="Receive receipt via email"
              inputProps={{
                inputMode: "email",
                autoComplete: "email"
              }}
            />
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={handleEnterOrder}
            size="large"
            disabled={!!currentTransactionID}
            sx={{ 
              minWidth: { xs: '100%', sm: 160 },
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 700,
              boxShadow: '0px 4px 12px rgba(45, 106, 79, 0.3)',
              '&:hover': {
                boxShadow: '0px 6px 20px rgba(45, 106, 79, 0.4)',
              },
              '&:disabled': {
                background: '#E9ECEF',
                color: '#6C757D',
              }
            }}
          >
            Enter Order
          </Button>
        </Stack>          
      </Box>

      {currentTransactionID && receiptData && (
        <div ref={receiptRef}>
          <Receipt 
            totals={receiptData.totals} 
            transactionId={currentTransactionID}
            discounts={receiptData.discounts}
            voucher={receiptData.voucher}
          />

          <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="success"
              onClick={handleUpdateOrder}
              size="small"
            >
              Update This Order
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleNewOrder}
              size="small"
            >
              New Order
            </Button>
          </Stack>
        </div>
      )}

      <div style={{ height: "1rem" }} />

      <ShowTransactionID
        open={transactionIDDialogOpen}
        onClose={handleTransactionIDClose}
        transactionID={currentTransactionID}
      />
    </Container>
  );
}

export default OrderEntry;
