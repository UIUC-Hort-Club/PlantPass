import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { apiRequest } from "../../api/apiClient";
import PasswordField from "../common/PasswordField";

export default function PlantPassAccessModal({ open, onClose, onSuccess }) {
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!passphrase.trim()) {
      setError("Please enter a passphrase");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiRequest("/plantpass-access/verify", {
        method: "POST",
        body: { passphrase },
      }) as { token?: string };
      
      // Store the staff token returned from verification
      if (response.token) {
        localStorage.setItem("staff_token", response.token);
      }
      
      setPassphrase("");
      setError("");
      onSuccess();
    } catch (err) {
      console.error("Error verifying passphrase:", err);
      setError("Incorrect passphrase. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassphrase("");
    setError("");
    onClose();
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="xs" 
      fullWidth
      BackdropProps={{
        sx: {
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LockIcon color="primary" />
          <Typography variant="h6" component="span">
            Enter Passphrase
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          This area is restricted to Spring Plant Fair staff members. Please enter the passphrase to continue.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <PasswordField
          id="plantpass-passphrase"
          autoFocus
          fullWidth
          label="Passphrase"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          variant="outlined"
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
