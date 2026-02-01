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
  discounts = [], // Default to empty array
  selectedDiscounts = [], // Default to empty array
  onDiscountToggle,
  readOnly = false,
}) {
  // Ensure discounts is always an array
  const safeDiscounts = Array.isArray(discounts) ? discounts : [];
  const safeSelectedDiscounts = Array.isArray(selectedDiscounts) ? selectedDiscounts : [];

  const handleIndividualToggle = (discountName) => {
    if (readOnly) return; // Prevent changes if read-only
    
    const isSelected = safeSelectedDiscounts.includes(discountName);
    let newSelection;
    
    if (isSelected) {
      // Remove from selection
      newSelection = safeSelectedDiscounts.filter(name => name !== discountName);
    } else {
      // Add to selection
      newSelection = [...safeSelectedDiscounts, discountName];
    }
    
    if (onDiscountToggle) {
      onDiscountToggle(newSelection);
    }
  };

  if (safeDiscounts.length === 0) {
    return null; // Don't render if no discounts available
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
              // Defensive programming - ensure discount object exists and has required fields
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
                        // Handle both old and new schema, with fallbacks for undefined values
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