import React from 'react';
import { Box, Typography, Paper, Stack, Button } from '@mui/material';

export default function AdminConsole() {
  return (
    <Box sx={{ mt: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Admin Console
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Manage prices, discounts, and system tools.
        </Typography>

        <Stack spacing={2} mt={3}>
          <Button variant="outlined">Edit Product Prices</Button>
          <Button variant="outlined">Edit Discounts</Button>
          <Button variant="outlined">Clear Transactions</Button>
          <Button variant="outlined" color="error">
            Reset System
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
