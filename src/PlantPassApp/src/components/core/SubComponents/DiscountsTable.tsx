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
  Chip,
} from "@mui/material";
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import type { Discount } from '../../../types';

interface DiscountsTableProps {
  discounts?: Discount[];
  selectedDiscounts?: string[];
  onDiscountToggle?: (selectedDiscounts: string[]) => void;
  readOnly?: boolean;
}

export default function DiscountsTable({
  discounts = [],
  selectedDiscounts = [],
  onDiscountToggle,
  readOnly = false,
}: DiscountsTableProps) {
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
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <LocalOfferIcon sx={{ color: "#F77F00", fontSize: 28 }} />
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700,
            color: "#2D6A4F",
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
          }}
        >
          Available Discounts {readOnly && "(View Only)"}
        </Typography>
      </Box>
      <TableContainer 
        component={Paper}
        elevation={0}
        sx={{ 
          maxHeight: 300, 
          overflowY: "auto",
          overflowX: "auto",
          border: "1px solid #E9ECEF",
          borderRadius: 3,
          background: "#FFFFFF",
        }}
      >
        <Table size="small" sx={{ minWidth: { xs: 'auto', sm: 400 } }}>
          <TableHead>
            <TableRow sx={{ background: "linear-gradient(135deg, #FFF8F0 0%, #FFF4E6 100%)" }}>
              <TableCell sx={{ minWidth: 60, fontWeight: 700, color: "#F77F00", py: 2 }}>
                Apply
              </TableCell>
              <TableCell sx={{ minWidth: 200, fontWeight: 700, color: "#F77F00", py: 2 }}>
                Discount Name
              </TableCell>
              <TableCell sx={{ minWidth: 100, fontWeight: 700, color: "#F77F00", py: 2 }}>
                Value
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {safeDiscounts.map((discount, _index) => {
              if (!discount || !discount.name) {
                return null;
              }
              
              const isSelected = safeSelectedDiscounts.includes(discount.name);
              
              return (
                <TableRow 
                  key={discount.name}
                  sx={{
                    '&:nth-of-type(odd)': {
                      backgroundColor: '#FAFBFC',
                    },
                    '&:hover': {
                      backgroundColor: isSelected ? '#FFF4E6' : '#FFF8F0',
                    },
                    backgroundColor: isSelected ? '#FFF8F0' : 'transparent',
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleIndividualToggle(discount.name)}
                      size="medium"
                      disabled={readOnly}
                      sx={{
                        minWidth: 44,
                        minHeight: 44,
                        color: '#F77F00',
                        '&.Mui-checked': {
                          color: '#F77F00',
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500, color: "#212529" }}>
                    {discount.name}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={(() => {
                        const value = discount.value || 0;
                        
                        if (discount.type === 'dollar') {
                          return `-$${Number(value).toFixed(2)}`;
                        } else {
                          return `-${Number(value)}%`;
                        }
                      })()}
                      size="small"
                      sx={{
                        background: 'linear-gradient(135deg, #52B788 0%, #95D5B2 100%)',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                      }}
                    />
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
