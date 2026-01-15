import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import Divider from '@mui/material/Divider';
import SalesAnalytics from './SalesAnalytics';

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
          Welcome, Oh Great One.You are now in the admin console and have elevated privileges!
        </Typography>

        <Divider sx={{ my: 2 }} />

        <AdminTabPanel value={tabIndex} index={0}>
          <SalesAnalytics />
        </AdminTabPanel>

        <AdminTabPanel value={tabIndex} index={1}>
          <Typography>🛠 Edit Products</Typography>
        </AdminTabPanel>

        <AdminTabPanel value={tabIndex} index={2}>
          <Typography>🏷 Edit Discounts</Typography>
        </AdminTabPanel>

        <AdminTabPanel value={tabIndex} index={3}>
          <Typography>👥 Reset Password</Typography>
        </AdminTabPanel>
      </Paper>
    </Box>
  );
}
