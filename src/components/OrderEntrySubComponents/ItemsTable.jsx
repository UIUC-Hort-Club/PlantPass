// src/components/ItemsTable.jsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Box,
} from '@mui/material';

export default function ItemsTable({ stockItems, quantities, subtotals, onQuantityChange }) {
  return (
    <Box sx={{ maxHeight: 800, overflowY: 'auto' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '40%' }}><strong>Item</strong></TableCell>
            <TableCell sx={{ width: '20%' }}><strong>Price</strong></TableCell>
            <TableCell sx={{ width: '20%' }}><strong>Quantity</strong></TableCell>
            <TableCell sx={{ width: '20%' }}><strong>Total Price</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stockItems.map((item) => (
            <TableRow key={item.SKU}>
              <TableCell sx={{ width: '40%' }}>{item.Item}</TableCell>
              <TableCell sx={{ width: '20%' }}>${item.Price.toFixed(2)}</TableCell>
              <TableCell sx={{ width: '20%' }}>
                <TextField
                  type="number"
                  value={quantities[item.SKU]}
                  onChange={(e) => onQuantityChange(e, item.SKU)}
                  inputProps={{ min: 0 }}
                  size="small"
                  fullWidth
                />
              </TableCell>
              <TableCell sx={{ width: '20%' }}>${subtotals[item.SKU]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}