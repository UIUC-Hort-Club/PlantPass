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

function Receipt({ totals, transactionId, discounts = [], voucher = 0 }) {
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
          Transaction Receipt
        </Typography>

        {transactionId ? (
          <Alert severity="success">
            <strong>Transaction ID:</strong> {transactionId}
          </Alert>
        ) : (
          <Alert severity="warning">No transaction ID found.</Alert>
        )}

        <Typography
          variant="body1"
          sx={{ mb: 1 }}
          color={"black"}
          align="right"
        >
          Subtotal: ${Number(totals.subtotal || 0).toFixed(2)}
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
              {discounts.map((discount, index) => (
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

              {voucher > 0 && (
                <TableRow>
                  <TableCell>Club Voucher</TableCell>
                  <TableCell>-${Number(voucher).toFixed(2)}</TableCell>
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
          {/* Grand Total */}
          <Typography
            variant="body1"
            sx={{ mt: 2, fontWeight: 700 }}
            color="black"
            align="right"
          >
            Grand Total: ${Number(totals.grandTotal || 0).toFixed(2)}
          </Typography>
        </Stack>
      </Box>
    </Container>
  );
}

export default Receipt;
