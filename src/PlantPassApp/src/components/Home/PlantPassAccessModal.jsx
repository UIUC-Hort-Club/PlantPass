import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";

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
      // Verify passphrase against stored value
      const response = await fetch(`${window.APP_CONFIG?.API_BASE_URL || ""}/plantpass-access/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ passphrase }),
      });

      if (response.ok) {
        onSuccess();
        handleClose();
      } else {
        setError("Incorrect passphrase. Please try again.");
      }
    } catch (err) {
      console.error("Error verifying passphrase:", err);
      setError("Failed to verify passphrase. Please try again.");
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
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
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
          This area is restricted to Hort Club members. Please enter the passphrase to continue.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          autoFocus
          fullWidth
          label="Passphrase"
          type="password"
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
