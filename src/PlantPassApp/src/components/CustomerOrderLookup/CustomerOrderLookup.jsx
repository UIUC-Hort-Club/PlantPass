import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  IconButton,
  AppBar,
  Toolbar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { readTransaction } from "../../api/transaction_interface/readTransaction";
import Receipt from "../core/SubComponents/Receipt";
import LoadingSpinner from "../common/LoadingSpinner";
import { formatOrderId } from "../../utils/orderIdFormatter";

export default function CustomerOrderLookup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState("");
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const idFromUrl = searchParams.get("id");
    if (idFromUrl) {
      setOrderId(idFromUrl);
      handleLookup(idFromUrl);
    }
  }, [searchParams]);

  const handleLookup = async (id = orderId) => {
    if (!id.trim()) {
      setError("Please enter an order ID");
      return;
    }

    setLoading(true);
    setError("");
    setTransaction(null);

    try {
      const result = await readTransaction(id.trim());
      if (result) {
        setTransaction(result);
      } else {
        setError("Order not found");
      }
    } catch (err) {
      setError("Failed to load order. Please check the order ID and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLookup();
  };

  const handleOrderIdChange = (e) => {
    const formattedValue = formatOrderId(e.target.value);
    setOrderId(formattedValue);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #F8F9FA 0%, #FFFFFF 100%)",
      }}
    >
      {/* Header */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          background: "#FFFFFF",
          borderBottom: "3px solid #52B788",
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => navigate("/")}
            sx={{ mr: 2, color: "#2D6A4F" }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box
            component="img"
            src="/plantpass_logo_transp.png"
            alt="PlantPass Logo"
            sx={{
              height: 40,
              width: "auto",
            }}
          />
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Box
        sx={{
          maxWidth: 800,
          mx: "auto",
          p: { xs: 2, sm: 4 },
        }}
      >
        {/* Search Form */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>
            Order Lookup
          </Typography>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
              <TextField
                fullWidth
                label="Enter your order ID"
                value={orderId}
                onChange={handleOrderIdChange}
                placeholder="ABC-DEF"
                error={!!error && !loading}
                helperText={error && !loading ? error : ""}
                inputProps={{
                  maxLength: 7,
                  style: { textTransform: 'uppercase' }
                }}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{ minWidth: 120 }}
                disabled={loading}
              >
                Search
              </Button>
            </Box>
          </form>
        </Paper>

        {/* Loading */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <LoadingSpinner />
          </Box>
        )}

        {/* Receipt */}
        {transaction && !loading && (
          <Paper sx={{ p: 3 }}>
            <Receipt transaction={transaction} readOnly />
          </Paper>
        )}
      </Box>
    </Box>
  );
}
