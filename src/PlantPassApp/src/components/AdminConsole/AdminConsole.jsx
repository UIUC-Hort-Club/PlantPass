import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

function AdminTabPanel({ value, index, children }) {
  return value === index ? <Box sx={{ mt: 2 }}>{children}</Box> : null;
}

export default function AdminConsole({ tabIndex }) {
  return (
    <Box sx={{ mt: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Admin Console
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          You are now in the admin console and have elevated privileges.
        </Typography>

        <AdminTabPanel value={tabIndex} index={0}>
          <Typography>📊 Analytics Dashboard</Typography>
        </AdminTabPanel>

        <AdminTabPanel value={tabIndex} index={1}>
          <Typography>🛠 Edit Products</Typography>
        </AdminTabPanel>

        <AdminTabPanel value={tabIndex} index={2}>
          <Typography>🏷 Edit Discounts</Typography>
        </AdminTabPanel>
      </Paper>
    </Box>
  );
}
