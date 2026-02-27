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
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 2,
          fontWeight: 700,
          color: "#2D6A4F",
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
        }}
      >
        Product Listings {readOnly && "(View Only)"}
      </Typography>
      <TableContainer 
        component={Paper} 
        elevation={0}
        sx={{ 
          maxHeight: 800, 
          overflowY: "auto",
          overflowX: "auto",
          border: "1px solid #E9ECEF",
          borderRadius: 3,
          background: "#FFFFFF",
        }}
      >
        <Table size="small" sx={{ minWidth: { xs: 'auto', sm: 500 } }}>
          <TableHead>
            <TableRow sx={{ background: "linear-gradient(135deg, #F8F9FA 0%, #E8F5E9 100%)" }}>
              <TableCell sx={{ minWidth: 120, fontWeight: 700, color: "#2D6A4F", py: 2 }}>
                Item
              </TableCell>
              <TableCell sx={{ minWidth: 80, fontWeight: 700, color: "#2D6A4F", py: 2 }}>
                Price
              </TableCell>
              <TableCell sx={{ minWidth: 100, fontWeight: 700, color: "#2D6A4F", py: 2 }}>
                Quantity
              </TableCell>
              <TableCell sx={{ minWidth: 100, fontWeight: 700, color: "#2D6A4F", py: 2 }}>
                Total Price
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stockItems.map((item) => (
              <TableRow 
                key={item.SKU}
                sx={{
                  '&:nth-of-type(odd)': {
                    backgroundColor: '#FAFBFC',
                  },
                  '&:hover': {
                    backgroundColor: '#F1F8F4',
                  },
                  transition: 'background-color 0.2s ease',
                }}
              >
                <TableCell sx={{ fontWeight: 500, color: "#212529" }}>{item.Name}</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#52B788" }}>
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
                        boxSizing: 'border-box',
                        fontWeight: 600,
                      }
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#2D6A4F", fontSize: "1rem" }}>
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
