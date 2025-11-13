import React, { useState } from 'react';
import {
  Container,
  Tabs,
  Tab,
  Box,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AppHeader from '../components/Header';
import OrderEntry from '../components/OrderEntry';

const API_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbwr1UOin3Oot7ERF0cgz6xHxwPx2Y6cZ6AVs9U6dfRqdWTG_tzBVkhwvtso6Skx8Q0/exec';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function Home() {
  const [tabIndex, setTabIndex] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(true);

  return (
    <Container sx={{ backgroundColor: 'white', padding: '20px' }}>
      <AppHeader />
      <Box sx={{ height: '1rem' }} />

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={() => setSnackbarOpen(false)}
        autoHideDuration={6000}
        sx={{
          '& .MuiSnackbarContent-root': {
            width: '50%',
            justifyContent: 'center',
            textAlign: 'center',
          },
        }}
      >
        <Alert severity="info" variant="filled" onClose={() => setSnackbarOpen(false)}>
          This app is in active development.
        </Alert>
      </Snackbar>

      <Container
        sx={{
          borderWidth: '2px',
          borderColor: '#D3D3D3',
          borderStyle: 'solid',
          borderRadius: '12px',
        }}
      >
        <Tabs
          value={tabIndex}
          onChange={(e, newValue) => setTabIndex(newValue)}
          aria-label="PlantPass tabs"
          centered
        >
          <Tab label="Order Entry" icon={<CalculateIcon />} />
          <Tab label="Order Tracking" icon={<ListAltIcon />} />
        </Tabs>

        <TabPanel value={tabIndex} index={0}>
          <OrderEntry />
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          Second panel
        </TabPanel>
      </Container>
    </Container>
  );
}