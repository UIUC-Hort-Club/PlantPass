import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Snackbar,
  Alert,
} from '@mui/material';
import { Html5Qrcode } from 'html5-qrcode';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import SavedSearchIcon from '@mui/icons-material/SavedSearch';

export default function Scanner({ opened, onClose, onScan, products }) {
  const [matchedProduct, setMatchedProduct] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  const scannerContainerRef = useRef(null);
  const scannerInstanceRef = useRef(null);

  // ----------------------------------------------------
  // Load camera list
  // ----------------------------------------------------
  useEffect(() => {
    if (!opened) return;
    Html5Qrcode.getCameras()
      .then((devices) => {
        setCameras(devices);
        const backCam =
          devices.find((d) => d.label.toLowerCase().includes('back'))?.id ||
          devices[0]?.id;

        setSelectedCamera(backCam);
      })
      .catch((err) => console.error('Camera fetch error:', err));
  }, [opened]);

  // ----------------------------------------------------
  // Start scanner
  // ----------------------------------------------------
  useEffect(() => {
    if (!opened || !selectedCamera || !scannerContainerRef.current) return;

    const containerId = 'scanner-container';
    const qr = new Html5Qrcode(containerId);

    qr.start(
      { deviceId: { exact: selectedCamera } },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        const product = products.find((p) => p.SKU === decodedText);

        if (product) {
          setMatchedProduct(product);
          setSnackbarMsg(`Found (${product.SKU}) ${product.Item}`);
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
        } else {
          // No match → show warning
          setMatchedProduct(null);
          setSnackbarMsg(`SKU: ${decodedText} Not Found`);
          setSnackbarSeverity('warning');
          setSnackbarOpen(true);
        }
      },
      (err) => console.log('scan error', err)
    ).catch((err) => console.error('start error', err));

    scannerInstanceRef.current = qr;

    return () => {
      scannerInstanceRef.current
        ?.stop()
        .catch(() => {})
        .finally(() => {
          scannerInstanceRef.current?.clear();
          scannerInstanceRef.current = null;
        });
    };
  }, [opened, selectedCamera, products]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMatchedProduct(null);
    }, 0);

    return () => clearTimeout(timer);
  }, [opened]);

  return (
    <>
      <Dialog open={opened} onClose={onClose} fullWidth maxWidth="sm" keepMounted>
        {/* Dialog Title Bar */}
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Scan Item</Typography>

            {!matchedProduct ? (
              <SearchOffIcon sx={{ color: 'text.disabled', fontSize: 28 }} />
            ) : (
              <SavedSearchIcon sx={{ color: 'green', fontSize: 28 }} />
            )}
          </Box>
        </DialogTitle>

        <DialogContent style={{ overflow: 'hidden' }}>
          {/* Camera Toggle */}
          {cameras.length > 1 && (
            <Box sx={{ mb: 2 }}>
              <select
                value={selectedCamera || ''}
                onChange={(e) => setSelectedCamera(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  fontSize: '1rem',
                }}
              >
                {cameras.map((cam) => (
                  <option key={cam.id} value={cam.id}>
                    {cam.label || `Camera ${cam.id}`}
                  </option>
                ))}
              </select>
            </Box>
          )}

          {/* QR Scanner */}
          <Box
            id="scanner-container"
            ref={scannerContainerRef}
            sx={{
              width: '100%',
              height: '60%',
            }}
          />

          {/* Display matched item */}
          {matchedProduct && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body1">
                Item: <strong>{matchedProduct.Item} ({matchedProduct.SKU})</strong> <br />
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          {matchedProduct && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                onScan(matchedProduct); // existing callback
                // Show snackbar for added item
                setSnackbarMsg(`Added Item: ${matchedProduct.Item} (${matchedProduct.SKU})`);
                setSnackbarSeverity('info');
                setSnackbarOpen(true);
              }}
              size='small'
            >
              Add Item
            </Button>
          )}
          <Button onClick={onClose} color="secondary" size="small">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </>
  );
}
