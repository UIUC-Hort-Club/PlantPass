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
import { validateQuantity, validatePrice, validateEmail, validateTransactionItems } from "../../utils/validation";
import { Product, Discount, ReceiptData, ProductQuantities, ProductSubtotals } from "../../types";

function OrderEntry() {
  const { showSuccess, showWarning, showError } = useNotification();
  const { features } = useFeatureToggles();
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [quantities, setQuantities] = useState<ProductQuantities>({});
  const [subtotals, setSubtotals] = useState<ProductSubtotals>({});
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [voucher, setVoucher] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [currentTransactionID, setCurrentTransactionID] = useState("");
  const [transactionIDDialogOpen, setTransactionIDDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const computedSubtotal = Object.values(subtotals)
    .reduce((sum, val) => sum + (parseFloat(val as string) || 0), 0)
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
      console.error("Error loading products:", error);
      try {
        const data = [];
        setProducts(data);
        const { initialQuantities, initialSubtotals } = initializeProductQuantities(data);
        setQuantities(initialQuantities);
        setSubtotals(initialSubtotals);
        setVoucher("");
      } catch {
        // Failed to load products
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
      console.error("Error loading discounts:", error);
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

    // Use validation utility to ensure safe input
    const numericValue = validateQuantity(value);

    setQuantities((prev) => ({ ...prev, [sku]: numericValue }));

    const subtotal = (numericValue * item.Price).toFixed(2);
    setSubtotals((prev) => ({ ...prev, [sku]: subtotal }));
  };

  const handleDiscountToggle = (selectedDiscountNames: string[]) => {
    setSelectedDiscounts(selectedDiscountNames);
  };

  const handleEnterOrder = () => {
    const discountsWithSelection = transformDiscountsForOrder(discounts, selectedDiscounts);

    const items = Object.entries(quantities)
      .map(([sku, quantity]) => {
        const product = products.find((p) => p.SKU === sku);
        return {
          SKU: sku,
          item: product.Name,
          quantity: validateQuantity(quantity),
          price_ea: product.Price,
        };
      });

    // Validate transaction before sending
    const validation = validateTransactionItems(items);
    if (!validation.valid) {
      showWarning(validation.errors[0] || "Please add items to your order before submitting.");
      return;
    }

    // Validate email if provided
    if (customerEmail && !validateEmail(customerEmail)) {
      showWarning("Please enter a valid email address or leave it empty.");
      return;
    }

    const transaction = {
      timestamp: Math.floor(Date.now() / 1000),
      items,
      discounts: discountsWithSelection,
      voucher: validatePrice(voucher),
      // If email collection is disabled, always send empty string
      email: features.collectEmailAddresses ? (customerEmail || "") : "",
    };

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
        setTransactionIDDialogOpen(true);
      })
      .catch((_error) => {
        const errorMessage = _error.message || "An error occurred while recording the transaction. Please try again.";
        showError(errorMessage);
      });
  };

  const handleUpdateOrder = () => {
    if (!currentTransactionID) {
      showWarning("No current transaction to update.");
      return;
    }

    const discountsWithSelection = transformDiscountsForOrder(discounts, selectedDiscounts);

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
      .catch((_error) => {
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
                setVoucher(String(numeric));
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
          justifyContent={{ xs: "flex-start", sm: features.collectEmailAddresses ? "space-between" : "flex-end" }}
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
