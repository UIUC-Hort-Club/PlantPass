import React, { useEffect, useState } from 'react';
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
  Tab,
  Alert,
} from '@mui/material';

function Receipt({ totals, transactionId }) {
  const [discounts, setDiscounts] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/discounts.json`)
      .then((res) => res.json())
      .then((data) => setDiscounts(data))
      .catch((err) => console.error('Error loading discounts.json:', err));
  }, []);

  return (
    <Container sx={{ mt: 3 }} style={{ paddingLeft: '0px', paddingRight: '0px' }}>
      <Box
        sx={{
          border: '2px solid #d3d3d3',
          borderRadius: 2,
          padding: 2,
        }}
      >
        <Typography variant="h6" gutterBottom color={'black'} align="center">
          Transaction Receipt
        </Typography>

        {transactionId ? (
            <Alert severity="success"><strong>Transaction ID:</strong> {transactionId}</Alert>
          ) : (
            <Alert severity="warning">No transaction ID found.</Alert>
          )}

        <Typography variant="body1" sx={{ mb: 1 }} color={'black'} align="right">
          Subtotal: ${totals.subtotal}
        </Typography>

        <TableContainer component={Paper} elevation={0}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Discount Name</strong></TableCell>
                <TableCell><strong>Value</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {discounts.map((discount, index) => (
                <TableRow key={index}>
                  <TableCell>{discount.discount_name}</TableCell>
                  <TableCell>-${totals.discount}</TableCell>
                </TableRow>
              ))}

              <TableRow>
                <TableCell>Club Voucher</TableCell>
                <TableCell>-$0</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Stack direction="row" justifyContent="right" alignItems="center" sx={{ marginBottom: '10px' }}>
          {/* Grand Total */}
          <Typography variant="body1" sx={{ mt: 2, fontWeight: 700 }} color="black" align="right">
            Grand Total: ${totals.grandTotal}
          </Typography>
        </Stack>
      </Box>
    </Container>
  );
}

export default Receipt;
