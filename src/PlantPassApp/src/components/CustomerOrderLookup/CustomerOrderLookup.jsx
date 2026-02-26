import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  AppBar,
  Toolbar,
} from "@mui/material";
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
    } catch {
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
        height: transaction ? "auto" : "100vh",
        minHeight: transaction ? "100vh" : "auto",
        display: "flex",
        flexDirection: "column",
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
          <Box
            component="img"
            src="/plantpass_logo_transp.png"
            alt="PlantPass Logo"
            onClick={() => navigate("/")}
            sx={{
              height: 40,
              width: "auto",
              cursor: "pointer",
              "&:hover": {
                opacity: 0.8
              }
            }}
          />
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Box
        sx={{
          flex: transaction ? "0 1 auto" : 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: transaction ? "flex-start" : "center",
          maxWidth: 800,
          width: "100%",
          mx: "auto",
          p: { xs: 2, sm: 4 },
        }}
      >
        {/* Search Form */}
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 500, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
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
                sx={{ minWidth: { xs: "100%", sm: 120 } }}
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
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Receipt transaction={transaction} readOnly />
          </Paper>
        )}
      </Box>
    </Box>
  );
}
