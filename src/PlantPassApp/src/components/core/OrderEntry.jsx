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

function OrderEntry() {
  const { showSuccess, showWarning, showError } = useNotification();
  const receiptRef = useRef(null);
  
  const [products, setProducts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [subtotals, setSubtotals] = useState({});
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [totals, setTotals] = useState({
    subtotal: 0,
    discount: 0,
    grandTotal: 0,
  });
  const [receiptData, setReceiptData] = useState(null);
  const [voucher, setVoucher] = useState("");
  const [currentTransactionID, setCurrentTransactionID] = useState("");
  const [transactionIDDialogOpen, setTransactionIDDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const computedSubtotal = Object.values(subtotals)
    .reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
    .toFixed(2);

  const handleNewOrder = () => {
    loadProducts();
    loadDiscounts();
    setCurrentTransactionID("");
    setTransactionIDDialogOpen(false);
    setSelectedDiscounts([]);
    setTotals({
      subtotal: 0,
      discount: 0,
      grandTotal: 0,
    });
    setReceiptData(null);
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
    };

    if (Object.values(quantities).every(qty => !qty || parseInt(qty) === 0)) {
      showWarning("Please add items to your order before submitting.");
      return;
    }

    createTransaction(transaction)
      .then((response) => {
        setCurrentTransactionID(response.purchase_id);
        setTotals({
          subtotal: response.receipt.subtotal,
          discount: response.receipt.discount,
          grandTotal: response.receipt.total,
        });
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
        setTotals({
          subtotal: response.receipt.subtotal,
          discount: response.receipt.discount,
          grandTotal: response.receipt.total,
        });
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
      <Container maxWidth="md" sx={{ px: { xs: 0.5, sm: 3 } }}>
        <LoadingSpinner message="Loading products..." />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ px: { xs: 0.5, sm: 3 } }}>
      <ItemsTable
        stockItems={products}
        quantities={quantities}
        subtotals={subtotals}
        onQuantityChange={handleQuantityChange}
      />

      <Stack
        direction="column"
        spacing={1}
        sx={{mt: '15px'}}
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
              if (!Number.isNaN(numeric)) {
                setVoucher(numeric);
              }
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
      </Stack>

      <DiscountsTable
        discounts={discounts}
        selectedDiscounts={selectedDiscounts}
        onDiscountToggle={handleDiscountToggle}
      />

      <Box sx={{ mt: 2 }}>
        <Stack
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleEnterOrder}
            size="small"
            disabled={!!currentTransactionID}
          >
            Enter
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
