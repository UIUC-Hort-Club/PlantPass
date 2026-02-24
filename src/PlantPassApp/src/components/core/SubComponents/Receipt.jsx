import React from "react";
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Alert,
} from "@mui/material";

function Receipt({ totals, transactionId, discounts = [], voucher = 0, transaction, readOnly = false }) {
  // If transaction object is provided, extract data from it
  let displayTransactionId = transactionId;
  let displayDiscounts = discounts;
  let displayVoucher = voucher;
  let displayTotals = totals;
  let displayItems = [];

  if (transaction) {
    displayTransactionId = transaction.purchase_id;
    displayDiscounts = transaction.discounts || [];
    displayVoucher = transaction.voucher || 0;
    displayItems = transaction.items || [];
    
    // Calculate totals from transaction
    const subtotal = displayItems.reduce((sum, item) => 
      sum + (item.price_ea * item.quantity), 0
    );
    const totalDiscounts = displayDiscounts.reduce((sum, discount) => 
      sum + (discount.amount_off || 0), 0
    );
    const grandTotal = subtotal - totalDiscounts - displayVoucher;
    
    displayTotals = {
      subtotal,
      grandTotal
    };
  }

  return (
    <Container
      sx={{ mt: 3 }}
      style={{ paddingLeft: "0px", paddingRight: "0px" }}
    >
      <Box
        sx={{
          border: "2px solid #d3d3d3",
          borderRadius: 2,
          padding: 2,
        }}
      >
        <Typography variant="h6" gutterBottom color={"black"} align="center">
          {readOnly ? "Order Details" : "Transaction Receipt"}
        </Typography>

        {displayTransactionId ? (
          <Alert severity="success">
            <strong>{readOnly ? "Order ID" : "Transaction ID"}:</strong> {displayTransactionId}
          </Alert>
        ) : (
          <Alert severity="warning">No transaction ID found.</Alert>
        )}

        {/* Items table for read-only mode */}
        {readOnly && displayItems.length > 0 && (
          <TableContainer component={Paper} elevation={0} sx={{ mt: 2, mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Item</strong></TableCell>
                  <TableCell align="right"><strong>Qty</strong></TableCell>
                  <TableCell align="right"><strong>Price</strong></TableCell>
                  <TableCell align="right"><strong>Total</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.item}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">${Number(item.price_ea).toFixed(2)}</TableCell>
                    <TableCell align="right">${(item.price_ea * item.quantity).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Typography
          variant="body1"
          sx={{ mb: 1 }}
          color={"black"}
          align="right"
        >
          Subtotal: ${Number(displayTotals?.subtotal || 0).toFixed(2)}
        </Typography>

        <TableContainer component={Paper} elevation={0}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Discount Name</strong>
                </TableCell>
                <TableCell>
                  <strong>Value</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayDiscounts.map((discount, index) => (
                <TableRow key={index}>
                  <TableCell 
                    sx={{ 
                      color: discount.amount_off > 0 ? 'black' : 'gray',
                      fontStyle: discount.amount_off > 0 ? 'normal' : 'italic'
                    }}
                  >
                    {discount.name}
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      color: discount.amount_off > 0 ? 'black' : 'gray',
                      fontStyle: discount.amount_off > 0 ? 'normal' : 'italic'
                    }}
                  >
                    -${Number(discount.amount_off || 0).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}

              {displayVoucher > 0 && (
                <TableRow>
                  <TableCell>Club Voucher</TableCell>
                  <TableCell>-${Number(displayVoucher).toFixed(2)}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack
          direction="row"
          justifyContent="right"
          alignItems="center"
          sx={{ marginBottom: "10px" }}
        >
          <Typography
            variant="body1"
            sx={{ mt: 2, fontWeight: 700 }}
            color="black"
            align="right"
          >
            Grand Total: ${Number(displayTotals?.grandTotal || 0).toFixed(2)}
          </Typography>
        </Stack>
      </Box>
    </Container>
  );
}

export default Receipt;
