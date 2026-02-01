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
  discounts,
  selectedDiscounts,
  onDiscountToggle,
  readOnly = false,
}) {
  const handleIndividualToggle = (discountName) => {
    if (readOnly) return; // Prevent changes if read-only
    
    const isSelected = selectedDiscounts.includes(discountName);
    let newSelection;
    
    if (isSelected) {
      // Remove from selection
      newSelection = selectedDiscounts.filter(name => name !== discountName);
    } else {
      // Add to selection
      newSelection = [...selectedDiscounts, discountName];
    }
    
    onDiscountToggle(newSelection);
  };

  if (discounts.length === 0) {
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
            {discounts.map((discount) => (
              <TableRow key={discount.name}>
                <TableCell>
                  <Checkbox
                    checked={selectedDiscounts.includes(discount.name)}
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
                    {discount.type === 'dollar' 
                      ? `-$${discount.value.toFixed(2)}`
                      : `-${discount.value}%`
                    }
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}