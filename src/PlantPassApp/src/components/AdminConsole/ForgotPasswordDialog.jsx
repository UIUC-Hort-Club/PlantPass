import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { requestPasswordReset } from "../../api/authentication/forgotPassword";

function ForgotPasswordDialog({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleRequestReset = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await requestPasswordReset();
      setSuccess(true);
    } catch {
      setError("Failed to send password reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Forgot Password</DialogTitle>
      <DialogContent>
        {!success && !error && (
          <Typography>
            A temporary password will be sent to the UIUC Horticulture Club email address.
            The temporary password will expire in 15 minutes.
          </Typography>
        )}
        
        {success && (
          <Alert severity="success">
            A temporary password has been sent to the registered email address.
            Please check your email and use the temporary password to log in.
          </Alert>
        )}
        
        {error && (
          <Alert severity="error">{error}</Alert>
        )}
      </DialogContent>
      <DialogActions>
        {!success && (
          <Button onClick={handleRequestReset} disabled={loading} variant="contained">
            {loading ? <CircularProgress size={24} /> : "Send Reset Email"}
          </Button>
        )}
        <Button onClick={handleClose} disabled={loading}>
          {success ? "Close" : "Cancel"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ForgotPasswordDialog;
