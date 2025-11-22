import React, { useState } from 'react';
import { TextField, Button, Stack } from '@mui/material';

function OrderLookup({ onLookup }) {
  const [orderId, setOrderId] = useState('');

  const handleLookup = () => {
    if (onLookup) {
      onLookup(orderId);
    }
  };

  return (
    <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="center" sx={{margin: "0px 10px 10px 10px"}}>
      <TextField
        label="Enter Order ID"
        variant="outlined"
        size="small"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
      />
      <Button variant="contained" color="primary" size="small" onClick={handleLookup}>
        Lookup
      </Button>
    </Stack>
  );
}

export default OrderLookup;