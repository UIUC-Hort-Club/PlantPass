import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import OrderEntry from './components/OrderEntry';
import OrderLookup from './components/OrderLookup';
import OrderTracking from './components/OrderTracking';

const DISCOUNTS_SOURCE = `${import.meta.env.BASE_URL}data/discounts.json`;
const PRODUCTS_SOURCE = `${import.meta.env.BASE_URL}data/products.json`;

function TabPanel({ children, value, index }) {
  return <div hidden={value !== index}>{value === index && <Box sx={{ pt: 2 }}>{children}</Box>}</div>;
}

export default function App() {
  const [tabIndex, setTabIndex] = useState(0);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleMenuOpen = (event) => setMenuAnchorEl(event.currentTarget);
  const handleMenuClose = () => setMenuAnchorEl(null);

  const handleMenuItemClick = (index) => {
    setTabIndex(index);
    handleMenuClose();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        maxWidth: 800,
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        py: 2,
      }}
    >
      {/* AppBar with logo, title + hamburger menu */}
      <AppBar position="static" elevation={0} sx={{ mb: 2 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Logo */}
            <Box
              component="img"
              src="hort_club_logo.png"
              alt="PlantPass Logo"
              sx={{
                height: 32,
                width: 32,
                objectFit: 'contain',
              }}
            />
            {/* App Title */}
            <Typography variant="h6" fontWeight={600} component="div">
              UIUC Hort Club PlantPass
            </Typography>
          </Box>

          {/* Hamburger Menu */}
          <IconButton edge="end" color="inherit" aria-label="menu" onClick={handleMenuOpen}>
            <MenuIcon />
          </IconButton>

          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => handleMenuItemClick(0)}>Entry</MenuItem>
            <MenuItem onClick={() => handleMenuItemClick(1)}>Lookup</MenuItem>
            <MenuItem onClick={() => handleMenuItemClick(2)}>Tracking</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Panels */}
      <TabPanel value={tabIndex} index={0}>
        <OrderEntry product_listings={PRODUCTS_SOURCE} />
      </TabPanel>

      <TabPanel value={tabIndex} index={1}>
        <OrderLookup />
      </TabPanel>

      <TabPanel value={tabIndex} index={2}>
        <OrderTracking />
      </TabPanel>
    </Box>
  );
}
