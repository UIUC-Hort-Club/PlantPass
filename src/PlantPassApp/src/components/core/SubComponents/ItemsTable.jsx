// src/components/ItemsTable.jsx
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
} from "@mui/material";

export default function ItemsTable({
  stockItems,
  quantities,
  subtotals,
  onQuantityChange,
}) {
  return (
    <Box sx={{ maxHeight: 800, overflowY: "auto" }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Product Listings
        </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: "40%" }}>
              <strong>Item</strong>
            </TableCell>
            <TableCell sx={{ width: "20%" }}>
              <strong>Price</strong>
            </TableCell>
            <TableCell sx={{ width: "20%" }}>
              <strong>Quantity</strong>
            </TableCell>
            <TableCell sx={{ width: "20%" }}>
              <strong>Total Price</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stockItems.map((item) => (
            <TableRow key={item.SKU}>
              <TableCell sx={{ width: "40%" }}>{item.Name}</TableCell>
              <TableCell sx={{ width: "20%" }}>
                ${item.Price.toFixed(2)}
              </TableCell>
              <TableCell sx={{ width: "20%" }}>
                <TextField
                  type="number"
                  value={quantities[item.SKU]}
                  onChange={(e) => onQuantityChange(e, item.SKU)}
                  inputProps={{ 
                    min: 0,
                    step: 1,
                    pattern: "[0-9]*"
                  }}
                  onKeyDown={(e) => {
                    // Prevent decimal point, minus sign, and 'e' (scientific notation)
                    if (e.key === '.' || e.key === '-' || e.key === 'e' || e.key === 'E') {
                      e.preventDefault();
                    }
                  }}
                  size="small"
                  fullWidth
                />
              </TableCell>
              <TableCell sx={{ width: "20%" }}>
                ${subtotals[item.SKU]}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
