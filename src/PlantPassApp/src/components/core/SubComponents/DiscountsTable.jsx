import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  Box,
  Typography,
  TableContainer,
  Paper,
} from "@mui/material";

export default function DiscountsTable({
  discounts = [],
  selectedDiscounts = [],
  onDiscountToggle,
  readOnly = false,
}) {
  const safeDiscounts = Array.isArray(discounts) ? discounts : [];
  const safeSelectedDiscounts = Array.isArray(selectedDiscounts) ? selectedDiscounts : [];

  const handleIndividualToggle = (discountName) => {
    if (readOnly) return;
    
    const isSelected = safeSelectedDiscounts.includes(discountName);
    let newSelection;
    
    if (isSelected) {
      newSelection = safeSelectedDiscounts.filter(name => name !== discountName);
    } else {
      newSelection = [...safeSelectedDiscounts, discountName];
    }
    
    if (onDiscountToggle) {
      onDiscountToggle(newSelection);
    }
  };

  if (safeDiscounts.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Available Discounts {readOnly && "(View Only)"}
      </Typography>
      <TableContainer 
        component={Paper}
        sx={{ 
          maxHeight: 300, 
          overflowY: "auto",
          overflowX: "auto"
        }}
      >
        <Table size="small" sx={{ minWidth: 400 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 60 }}>
                <strong>Apply</strong>
              </TableCell>
              <TableCell sx={{ minWidth: 200 }}>
                <strong>Discount Name</strong>
              </TableCell>
              <TableCell sx={{ minWidth: 100 }}>
                <strong>Value</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {safeDiscounts.map((discount, index) => {
              if (!discount || !discount.name) {
                console.warn(`Invalid discount at index ${index}:`, discount);
                return null;
              }
              
              return (
                <TableRow key={discount.name}>
                  <TableCell>
                    <Checkbox
                      checked={safeSelectedDiscounts.includes(discount.name)}
                      onChange={() => handleIndividualToggle(discount.name)}
                      size="medium"
                      disabled={readOnly}
                      sx={{
                        minWidth: 44,
                        minHeight: 44
                      }}
                    />
                  </TableCell>
                  <TableCell>{discount.name}</TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'success.main',
                        fontWeight: 'medium'
                      }}
                    >
                      {(() => {
                        const value = discount.value || discount.value_off || discount.percent_off || 0;
                        
                        if (discount.type === 'dollar') {
                          return `-$${Number(value).toFixed(2)}`;
                        } else {
                          return `-${Number(value)}%`;
                        }
                      })()}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
