import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Box,
  Typography,
  TableContainer,
  Paper,
} from "@mui/material";

export default function ItemsTable({
  stockItems,
  quantities,
  subtotals,
  onQuantityChange,
  readOnly = false,
}) {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
          Product Listings {readOnly && "(View Only)"}
      </Typography>
      <TableContainer 
        component={Paper} 
        sx={{ 
          maxHeight: 800, 
          overflowY: "auto",
          overflowX: "auto"
        }}
      >
        <Table size="small" sx={{ minWidth: 500 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 120 }}>
                <strong>Item</strong>
              </TableCell>
              <TableCell sx={{ minWidth: 80 }}>
                <strong>Price</strong>
              </TableCell>
              <TableCell sx={{ minWidth: 100 }}>
                <strong>Quantity</strong>
              </TableCell>
              <TableCell sx={{ minWidth: 100 }}>
                <strong>Total Price</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stockItems.map((item) => (
              <TableRow key={item.SKU}>
                <TableCell>{item.Name}</TableCell>
                <TableCell>
                  ${(item.Price || 0).toFixed(2)}
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={quantities[item.SKU]}
                    onChange={(e) => onQuantityChange(e, item.SKU)}
                    inputProps={{ 
                      min: 0,
                      step: 1,
                      pattern: "[0-9]*",
                      inputMode: "numeric"
                    }}
                    onKeyDown={(e) => {
                      if (e.key === '.' || e.key === '-' || e.key === 'e' || e.key === 'E') {
                        e.preventDefault();
                      }
                    }}
                    size="small"
                    fullWidth
                    disabled={readOnly}
                    sx={{
                      minWidth: 80,
                      '& .MuiInputBase-input': {
                        minHeight: 44,
                        boxSizing: 'border-box'
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  ${subtotals[item.SKU]}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
