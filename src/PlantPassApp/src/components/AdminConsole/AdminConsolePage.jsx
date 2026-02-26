import { useState, useEffect } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import AdminConsole from "./AdminConsole";
import AdminPasswordModal from "./AdminPasswordModal";
import ForgotPasswordDialog from "./ForgotPasswordDialog";
import NavigationMenu from "../Navigation/NavigationMenu";
import { useFeatureToggles } from "../../contexts/FeatureToggleContext";
import { authenticateAdmin } from "../../api/authentication/passwordAuthentication";

export default function AdminConsolePage() {
  const navigate = useNavigate();
  const { features } = useFeatureToggles();
  
  const [adminTabIndex, setAdminTabIndex] = useState(0);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [adminError, setAdminError] = useState("");

  useEffect(() => {
    // Check if user has already authenticated
    const isAdminAuthenticated = localStorage.getItem("admin_auth") === "true";
    
    if (isAdminAuthenticated) {
      setIsAuthenticated(true);
      setAdminModalOpen(false);
    } else if (!features.passwordProtectAdmin) {
      // If password protection is disabled, grant immediate access
      setIsAuthenticated(true);
      setAdminModalOpen(false);
    } else {
      // Show password modal
      setAdminModalOpen(true);
    }
  }, [features.passwordProtectAdmin]);

  const handleMenuOpen = (event) => setMenuAnchorEl(event.currentTarget);
  const handleMenuClose = () => setMenuAnchorEl(null);

  const handleMenuItemClick = (index) => {
    setAdminTabIndex(index);
  };

  const handleForgotPassword = () => {
    setAdminModalOpen(false);
    setForgotPasswordOpen(true);
  };

  const handleAdminPasswordSubmit = (password) => {
    return authenticateAdmin(password)
      .then(() => {
        localStorage.setItem("admin_auth", "true");
        setIsAuthenticated(true);
        setAdminModalOpen(false);
        setAdminError('');
      })
      .catch((error) => {
        setAdminError('Password incorrect');
        throw error;
      });
  };

  const handleModalClose = () => {
    setAdminModalOpen(false);
    setAdminError("");
    navigate("/");
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
      {/* App header */}
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
          {/* Logo - clickable to go home */}
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
            <IconButton edge="end" sx={{ color: "#2D6A4F" }} onClick={handleMenuOpen}>
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Navigation menu */}
          <NavigationMenu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
            isAdmin={true}
            onNavigate={handleMenuItemClick}
          />
        </Toolbar>
      </AppBar>

      {/* Main content */}
      {isAuthenticated && (
        <AdminConsole tabIndex={adminTabIndex} />
      )}

      {/* Admin password modal */}
      <AdminPasswordModal
        open={adminModalOpen}
        onClose={handleModalClose}
        onSubmit={handleAdminPasswordSubmit}
        error={adminError}
        onForgotPassword={handleForgotPassword}
      />
      
      {/* Forgot password dialog */}
      <ForgotPasswordDialog
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
      />
    </Box>
  );
}
