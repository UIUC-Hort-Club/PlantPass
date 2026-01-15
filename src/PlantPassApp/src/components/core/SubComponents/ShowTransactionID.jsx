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

					{/* Display the transaction ID */}
					<Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold', wordBreak: 'break-all' }}>
						{transactionID || "Loading..."}
					</Typography>

					{/* Optionally send an email receipt to the customer with this transaction ID and order details */}
					{/* <TextField
						label="Customer Email (optional)"
						type="email"
						size='small'
						helperText="Enter customer's email to send them a receipt with this transaction ID and order details"
						fullWidth
						sx={{ mt: 3 }}
					/> */}
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
