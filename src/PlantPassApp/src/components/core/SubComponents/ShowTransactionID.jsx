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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function ShowTransactionID({
  open,
  onClose,
  transactionID,
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      maxWidth="xs"
      fullWidth
    >
      <Box>
        <DialogTitle sx={{ pr: 5 }}>
          Transaction ID
          <IconButton
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please provide this transaction ID to the customer. They will need to give this ID to the cashier in order to retrieve their order and pay.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} variant="outlined">
            Done
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
