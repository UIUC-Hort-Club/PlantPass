import React, { useState } from "react";

/* =========================
   MUI — layout & utilities
   ========================= */
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";

/* =========================
   MUI — icons
   ========================= */
import MenuIcon from "@mui/icons-material/Menu";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import PublicIcon from "@mui/icons-material/Public";

/* =========================
   API utilities
   ========================= */
import { authenticateAdmin } from "./api/authentication/passwordAuthentication";

/* =========================
   Application components
   ========================= */
import OrderEntry from "./components/core/OrderEntry";
import OrderLookup from "./components/core/OrderLookup";
import AdminConsole from "./components/AdminConsole/AdminConsole";
import AdminPasswordModal from "./components/AdminConsole/AdminPasswordModal";
import NavigationMenu from "./components/Navigation/NavigationMenu";
import { NotificationProvider } from "./contexts/NotificationContext";

/* =========================
   Static data sources

   TODO @joe: eventually replace with real API calls, but this is fine for now since the data is pretty static and read-only
   ========================= */
const DISCOUNTS_SOURCE = `${import.meta.env.BASE_URL}data/discounts.json`;
const PRODUCTS_SOURCE = `${import.meta.env.BASE_URL}data/products.json`;

/* =========================
   Helper components
   ========================= */
function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function App() {
  /* =========================
     Theme / responsiveness
     ========================= */
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  /* =========================
     Navigation & UI state
     ========================= */
  const [tabIndex, setTabIndex] = useState(0);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  /* =========================
     Admin state
     ========================= */
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTabIndex, setAdminTabIndex] = useState(0);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminError, setAdminError] = useState("");

  /* =========================
     Menu handlers
     ========================= */
  const handleMenuOpen = (event) => setMenuAnchorEl(event.currentTarget);
  const handleMenuClose = () => setMenuAnchorEl(null);

  const handleMenuItemClick = (index) => {
    if (isAdmin) {
      setAdminTabIndex(index);
    } else {
      setTabIndex(index);
    }
  };

  /* =========================
     Admin handlers
     ========================= */
  const handleAdminClick = () => {
    setAdminModalOpen(true);
  };

  const handleAdminPasswordSubmit = (password) => {
    setIsAdmin(true);
    setAdminModalOpen(false);
    setAdminError("");

    // return authenticateAdmin(password)  // <-- return promise so modal can handle loading state
    //   .then(() => {
    //     setIsAdmin(true);
    //     setAdminModalOpen(false);
    //     setAdminError('');
    //   })
    //   .catch((error) => {
    //     setAdminError('Password incorrect');
    //     throw error; // re-throw so modal can catch it if needed
    //   });
  };

  const handleHomeClick = () => {
    setIsAdmin(false);
    setTabIndex(0);
    setAdminTabIndex(0);
  };

  return (
    <NotificationProvider>
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          maxWidth: 800,
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
          py: 2,
        }}
      >
      {/* =========================
          App header
         ========================= */}
      <AppBar position="static" elevation={0} sx={{ mb: 2 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Logo + title */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              component="img"
              src="plantpass_logo_transp.png"
              alt="PlantPass Logo"
              sx={{
                height: "100%",
                maxHeight: 56,
                width: "auto",
                objectFit: "contain",
              }}
            />
          </Box>

          {/* Header actions */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {!isAdmin ? (
              <IconButton color="inherit" onClick={handleAdminClick}>
                <SupervisorAccountIcon />
              </IconButton>
            ) : (
              <IconButton color="inherit" onClick={handleHomeClick}>
                <PublicIcon />
              </IconButton>
            )}

            <IconButton edge="end" color="inherit" onClick={handleMenuOpen}>
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Navigation menu */}
          <NavigationMenu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
            isAdmin={isAdmin}
            onNavigate={handleMenuItemClick}
          />
        </Toolbar>
      </AppBar>

      {/* =========================
          Main content
         ========================= */}
      {!isAdmin ? (
        <>
          <TabPanel value={tabIndex} index={0}>
            <OrderEntry product_listings={PRODUCTS_SOURCE} />
          </TabPanel>

          <TabPanel value={tabIndex} index={1}>
            <OrderLookup />
          </TabPanel>
        </>
      ) : (
        <AdminConsole tabIndex={adminTabIndex} />
      )}

      {/* =========================
          Admin password modal
         ========================= */}
      <AdminPasswordModal
        open={adminModalOpen}
        onClose={() => {
          setAdminModalOpen(false);
          setAdminError("");
        }}
        onSubmit={handleAdminPasswordSubmit}
        error={adminError}
      />
    </Box>
    </NotificationProvider>
  );
}
