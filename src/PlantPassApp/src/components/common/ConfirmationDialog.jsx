import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Box,
} from '@mui/material';

export default function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  requireTextConfirmation = false,
  confirmationText = "",
  severity = "warning"
}) {
  const [textInput, setTextInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (requireTextConfirmation && textInput !== confirmationText) {
      return;
    }

    try {
      setLoading(true);
      await onConfirm();
      handleClose();
    } catch (error) {
      console.error("Confirmation action failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTextInput("");
    setLoading(false);
    onClose();
  };

  const isConfirmDisabled = loading || (requireTextConfirmation && textInput !== confirmationText);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {message}
        </Typography>
        
        {requireTextConfirmation && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Type &quot;{confirmationText}&quot; to confirm:
            </Typography>
            <TextField
              fullWidth
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={confirmationText}
              size="small"
              error={textInput !== "" && textInput !== confirmationText}
              helperText={textInput !== "" && textInput !== confirmationText ? "Text does not match" : ""}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isConfirmDisabled}
          color={severity === "error" ? "error" : "primary"}
          variant="contained"
        >
          {loading ? "Processing..." : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}