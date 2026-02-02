import { useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import PublicIcon from "@mui/icons-material/Public";
import { authenticateAdmin } from "./api/authentication/passwordAuthentication";
import OrderEntry from "./components/core/OrderEntry";
import OrderLookup from "./components/core/OrderLookup";
import AdminConsole from "./components/AdminConsole/AdminConsole";
import AdminPasswordModal from "./components/AdminConsole/AdminPasswordModal";
import NavigationMenu from "./components/Navigation/NavigationMenu";
import { NotificationProvider } from "./contexts/NotificationContext";

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

    // return authenticateAdmin(password)
    //   .then(() => {
    //     setIsAdmin(true);
    //     setAdminModalOpen(false);
    //     setAdminError('');
    //   })
    //   .catch((error) => {
    //     setAdminError('Password incorrect');
    //     throw error;
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
            <OrderEntry />
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
