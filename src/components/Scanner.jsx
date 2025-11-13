import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function Scanner({ opened, onClose, onScan }) {
  const [pendingScan, setPendingScan] = useState(null);
  const scannerContainerRef = useRef(null);
  const scannerInstanceRef = useRef(null);

  useEffect(() => {
    // Initialize scanner only when dialog is open and container is rendered
    // its finiskcy about the app state
    if (opened && scannerContainerRef.current) {
      const containerId = 'scanner-container';

      // Create the scanner instance
      scannerInstanceRef.current = new Html5QrcodeScanner(containerId, {
        fps: 10,
        qrbox: 250,
      });

      // Start rendering scanner
      scannerInstanceRef.current.render(
        (decodedText) => {
          setPendingScan(decodedText);
        },
        (error) => {
          console.error('QR Scan Error:', error);
        }
      );
    }

    // Cleanup scanner when dialog closes or component unmounts
    return () => {
      if (scannerInstanceRef.current) {
        scannerInstanceRef.current
          .clear()
          .catch((err) => console.error('Failed to clear scanner:', err));
        scannerInstanceRef.current = null;
      }
    };
  }, [opened]);

  return (
    <Dialog open={opened} onClose={onClose} fullWidth maxWidth="sm" keepMounted>
      <DialogTitle>Scan Barcode</DialogTitle>
      <DialogContent style={{overflow: "hidden"}}>
        <Box
          id="scanner-container"
          ref={scannerContainerRef}
          sx={{
            width: '100%',
            height: '100%',
            borderRadius: 2,
          }}
        />
        {pendingScan && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body1">
              Scanned: <strong>{pendingScan}</strong>
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {pendingScan && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => onScan(pendingScan)}
          >
            Add Item
          </Button>
        )}
        <Button onClick={onClose} color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
