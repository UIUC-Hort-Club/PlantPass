import React, { useState } from 'react';
import { Paper, Typography, TextField, Box } from '@mui/material';

function OrderIdDemo() {
  const [orderId, setOrderId] = useState("");

  const formatOrderId = (input) => {
    // Remove any non-alphabetic characters and convert to uppercase
    const cleanInput = input.replace(/[^a-zA-Z]/g, '').toUpperCase();
    
    // Limit to 6 characters
    const limitedInput = cleanInput.slice(0, 6);
    
    // Add dash after 3 characters if we have more than 3
    if (limitedInput.length > 3) {
      return `${limitedInput.slice(0, 3)}-${limitedInput.slice(3)}`;
    }
    
    return limitedInput;
  };

  const handleOrderIdChange = (e) => {
    const formattedValue = formatOrderId(e.target.value);
    setOrderId(formattedValue);
  };

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        Order ID Formatting Demo
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Type 6 letters (e.g., "abcdef") and watch it auto-format to "ABC-DEF":
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Order ID"
          size="small"
          value={orderId}
          onChange={handleOrderIdChange}
          placeholder="Enter 6 letters (e.g., abcdef)"
          inputProps={{
            maxLength: 7, // XXX-XXX format
            style: { textTransform: 'uppercase' }
          }}
        />
        <Typography variant="body2">
          Result: <strong>{orderId || "(empty)"}</strong>
        </Typography>
      </Box>
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        • Only letters are allowed<br/>
        • Automatically converts to uppercase<br/>
        • Adds dash after 3rd character<br/>
        • Limited to 6 letters total (XXX-XXX format)
      </Typography>
    </Paper>
  );
}

export default OrderIdDemo;