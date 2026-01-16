import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  Box,
  LinearProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function AdminPasswordModal({
  open,
  onClose,
  onSubmit,
  error,
}) {
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClose = () => {
    setPassword('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit(password);     // wait for result
      setPassword('');              // clear input only if successful
    } catch (err) {
      console.error("Admin authentication error:", err);
    } finally {
      setSubmitting(false);         // hide progress bar after result
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      maxWidth="xs"
      fullWidth
    >
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle sx={{ pr: 5 }}>
          Admin Access
          <IconButton
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Enter the admin password to continue.
          </Typography>

          <TextField
            autoFocus
            fullWidth
            size='small'
            type="password"
            label="Password"
            value={password}
            error={Boolean(error)}
            helperText={error}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
          >
            Enter
          </Button>
        </DialogActions>

        {submitting && <LinearProgress />}
      </Box>
    </Dialog>
  );
}
