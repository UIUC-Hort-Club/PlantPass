import { useState, useEffect } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import PublicIcon from "@mui/icons-material/Public";
import { useNavigate } from "react-router-dom";
import OrderEntry from "../core/OrderEntry";
import OrderLookup from "../core/OrderLookup";
import AdminConsole from "../AdminConsole/AdminConsole";
import AdminPasswordModal from "../AdminConsole/AdminPasswordModal";
import ForgotPasswordDialog from "../AdminConsole/ForgotPasswordDialog";
import NavigationMenu from "../Navigation/NavigationMenu";
import PlantPassAccessModal from "../Home/PlantPassAccessModal";
import { useFeatureToggles } from "../../contexts/FeatureToggleContext";

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function PlantPassApp() {
  const navigate = useNavigate();
  const { features } = useFeatureToggles();
  
  /* =========================
     Theme / responsiveness
     ========================= */
  const theme = useTheme();
  useMediaQuery(theme.breakpoints.down("sm"));

  /* =========================
     Navigation & UI state
     ========================= */
  const [tabIndex, setTabIndex] = useState(0);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  /* =========================
     PlantPass access state
     ========================= */
  const [hasPlantPassAccess, setHasPlantPassAccess] = useState(false);
  const [passphraseModalOpen, setPassphraseModalOpen] = useState(false);

  /* =========================
     Admin state
     ========================= */
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTabIndex, setAdminTabIndex] = useState(0);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [adminError, setAdminError] = useState("");

  /* =========================
     Check PlantPass access on mount
     ========================= */
  useEffect(() => {
    // Check if user has already authenticated
    const isAuthenticated = localStorage.getItem("plantpass_auth") === "true";
    
    if (isAuthenticated) {
      setHasPlantPassAccess(true);
      setPassphraseModalOpen(false);
    } else if (features.protectPlantPassAccess && !hasPlantPassAccess) {
      setPassphraseModalOpen(true);
    }
  }, [features.protectPlantPassAccess, hasPlantPassAccess]);

  /* =========================
     PlantPass access handlers
     ========================= */
  const handlePassphraseSuccess = () => {
    // Store authentication in localStorage
    localStorage.setItem("plantpass_auth", "true");
    setHasPlantPassAccess(true);
    setPassphraseModalOpen(false);
  };

  const handlePassphraseCancel = () => {
    setPassphraseModalOpen(false);
    navigate("/");
  };

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
    // If password protection is disabled, grant immediate access
    if (!features.passwordProtectAdmin) {
      setIsAdmin(true);
      return;
    }
    
    // Otherwise, show password modal
    setAdminModalOpen(true);
  };

  const handleForgotPassword = () => {
    setAdminModalOpen(false);
    setForgotPasswordOpen(true);
  };

  const handleAdminPasswordSubmit = (_password) => {
    setIsAdmin(true);
    setAdminModalOpen(false);
    setAdminError("");
    
    // @PASSWORD
    // @TODO
    // UNDO in the future

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
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        maxWidth: { xs: '100%', sm: 600, md: 800, lg: 1000 },
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, #F8F9FA 0%, #FFFFFF 100%)",
        py: { xs: 0, sm: 2 },
        px: 0,
      }}
    >
      {/* =========================
        App header
       ========================= */}
      <AppBar 
        position="static" 
        elevation={0} 
        sx={{ 
          mb: { xs: 2, sm: 3 },
          background: "#FFFFFF",
          borderBottom: "3px solid #52B788",
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", minHeight: { xs: 56, sm: 70 }, px: { xs: 2, sm: 3 } }}>
          {/* Logo + title - clickable to go home */}
          <Box 
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 1,
              cursor: "pointer",
              "&:hover": {
                opacity: 0.8
              }
            }}
            onClick={() => navigate("/")}
          >
            <Box
              component="img"
              src="/plantpass_logo_transp.png"
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
              <IconButton sx={{ color: "#2D6A4F" }} onClick={handleAdminClick}>
                <SupervisorAccountIcon />
              </IconButton>
            ) : (
              <IconButton sx={{ color: "#2D6A4F" }} onClick={handleHomeClick}>
                <PublicIcon />
              </IconButton>
            )}

            <IconButton edge="end" sx={{ color: "#2D6A4F" }} onClick={handleMenuOpen}>
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
      <Box
        sx={{
          filter: passphraseModalOpen ? "blur(8px)" : "none",
          pointerEvents: passphraseModalOpen ? "none" : "auto",
          transition: "filter 0.3s ease",
        }}
      >
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
      </Box>

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
        onForgotPassword={handleForgotPassword}
      />
      
      {/* =========================
        Forgot password dialog
       ========================= */}
      <ForgotPasswordDialog
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
      />

      {/* =========================
        PlantPass access modal
       ========================= */}
      <PlantPassAccessModal
        open={passphraseModalOpen}
        onClose={handlePassphraseCancel}
        onSuccess={handlePassphraseSuccess}
      />
    </Box>
  );
}
