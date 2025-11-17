import React, { useState } from 'react';
import {
  Container,
  Tabs,
  Tab,
  Box,
  Typography,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AppHeader from './components/Header';
import OrderEntry from './components/OrderEntry';

const DISCOUNTS_SOURCE = `${import.meta.env.BASE_URL}data/discounts.json`
const PRODUCTS_SOURCE = `${import.meta.env.BASE_URL}data/products.json`

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function App() {
  const [tabIndex, setTabIndex] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(true);
  const [mobileWarningOpen, setMobileWarningOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  React.useEffect(() => {
    if (!isMobile) {
      setMobileWarningOpen(true);
    }
  }, [isMobile]);

  return (
    <Container
      sx={{
        minHeight: '100vh',
        minWidth: '100vw',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        paddingTop: '20px',
      }}
    >
      <AppHeader />
      <Box sx={{ height: '1rem' }} />

      {/* Development Snackbar */}
      <Snackbar
        open={snackbarOpen}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={() => setSnackbarOpen(false)}
        autoHideDuration={6000}
        sx={{
          '& .MuiSnackbarContent-root': {
            width: { xs: '90%', sm: '70%', md: '50%' },
            justifyContent: 'center',
            textAlign: 'center',
          },
        }}
      >
        <Alert severity="info" variant="filled" onClose={() => setSnackbarOpen(false)}>
          This app is in active development.
        </Alert>
      </Snackbar>

      {/* Mobile Optimization Warning */}
      <Snackbar
        open={mobileWarningOpen}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        onClose={() => setMobileWarningOpen(false)}
        autoHideDuration={8000}
        sx={{
          '& .MuiSnackbarContent-root': {
            width: { xs: '90%', sm: '70%', md: '50%' },
            justifyContent: 'center',
            textAlign: 'center',
          },
        }}
      >
        <Alert severity="warning" variant="filled" onClose={() => setMobileWarningOpen(false)}>
          This app is optimized for mobile view. Desktop layout may be limited.
        </Alert>
      </Snackbar>

      {/* Tabs and Panels */}
      <Box sx={{ border: '2px solid #D3D3D3', borderRadius: '12px' }}>
        <Tabs
          value={tabIndex}
          onChange={(e, newValue) => setTabIndex(newValue)}
          aria-label="PlantPass tabs"
          variant="scrollable"
          scrollButtons="auto"
          TabIndicatorProps={{ sx: { display: 'none' } }}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            '& .MuiTabs-scroller': {
              display: 'flex',
              justifyContent: 'center',
            },
          }}
        >
          <Tab
            label={<Typography variant="body2">Entry</Typography>}
            icon={<CalculateIcon fontSize="small" />}
            iconPosition="start"
            sx={{
              '&.Mui-selected': { outline: 'none', border: 'none' },
              '&:focus': { outline: 'none', border: 'none' },
            }}
          />
          <Tab
            label={<Typography variant="body2">Tracking</Typography>}
            icon={<ListAltIcon fontSize="small" />}
            iconPosition="start"
            sx={{
              '&.Mui-selected': { outline: 'none', border: 'none' },
              '&:focus': { outline: 'none', border: 'none' },
            }}
          />
        </Tabs>

        <TabPanel value={tabIndex} index={0}>
          <OrderEntry
            product_listings={PRODUCTS_SOURCE}
          />
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          <Typography variant="body1" sx={{ mt: 2, color: "black"}}>
            Order tracking panel coming soon.
          </Typography>
        </TabPanel>
      </Box>
    </Container>
  );
}