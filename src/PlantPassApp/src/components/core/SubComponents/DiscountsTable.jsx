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
      <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: "15%" }}>
                <strong>Apply</strong>
              </TableCell>
              <TableCell sx={{ width: "60%" }}>
                <strong>Discount Name</strong>
              </TableCell>
              <TableCell sx={{ width: "25%" }}>
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
                      size="small"
                      disabled={readOnly}
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
      </Box>
    </Box>
  );
}