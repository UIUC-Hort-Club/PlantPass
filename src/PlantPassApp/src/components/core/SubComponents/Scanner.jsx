import React, { useEffect, useRef, useState } from "react";
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
} from "@mui/material";
import { Html5Qrcode } from "html5-qrcode";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import SavedSearchIcon from "@mui/icons-material/SavedSearch";
import { v4 as uuidv4 } from "uuid";

export default function Scanner({
  opened,
  onClose,
  onScan,
  products,
  getQuantity,
}) {
  const [matchedProduct, setMatchedProduct] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);

  const [snackbars, setSnackbars] = useState([]);
  const [foundSKUs, setFoundSKUs] = useState(new Set());

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
          devices.find((d) => d.label.toLowerCase().includes("back"))?.id ||
          devices[0]?.id;
        setSelectedCamera(backCam);
      })
      .catch((err) => console.error("Camera fetch error:", err));
  }, [opened]);

  // ----------------------------------------------------
  // Start scanner
  // ----------------------------------------------------
  useEffect(() => {
    if (!opened || !selectedCamera || !scannerContainerRef.current) return;

    const containerId = "scanner-container";
    const qr = new Html5Qrcode(containerId);

    qr.start(
      { deviceId: { exact: selectedCamera } },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        const product = products.find((p) => p.SKU === decodedText);

        if (product) {
          setMatchedProduct(product);

          // Only show Found snackbar if SKU hasn't been found yet
          if (!foundSKUs.has(product.SKU)) {
            setSnackbars((prev) => [
              ...prev,
              {
                id: uuidv4(),
                message: `Found (${product.SKU}) ${product.Item}`,
                severity: "success",
              },
            ]);
            setFoundSKUs((prev) => new Set(prev).add(product.SKU));
          }
        } else {
          setMatchedProduct(null);
          // Show Not Found message always
          setSnackbars((prev) => [
            ...prev,
            {
              id: uuidv4(),
              message: `SKU: ${decodedText} Not Found`,
              severity: "warning",
            },
          ]);
        }
      },
      (err) => console.log("scan error", err),
    ).catch((err) => console.error("start error", err));

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
  }, [opened, selectedCamera, products, foundSKUs]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMatchedProduct(null);
    }, 0);

    return () => clearTimeout(timer);
  }, [opened]);

  const handleAddItem = () => {
    if (!matchedProduct) return;

    // Compute what the new quantity will be
    const newQuantity = (getQuantity(matchedProduct.SKU) || 0) + 1;

    // Call parent callback to update state
    onScan(matchedProduct);

    // Show snackbar with the accurate quantity
    setSnackbars((prev) => [
      ...prev,
      {
        id: uuidv4(),
        message: `Added Item: ${matchedProduct.Item} (Qty: ${newQuantity})`,
        severity: "info",
      },
    ]);
  };

  const handleCloseSnackbar = (id) => {
    setSnackbars((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <>
      <Dialog
        open={opened}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        keepMounted
      >
        {/* Dialog Title Bar */}
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">Scan Item</Typography>
            {!matchedProduct ? (
              <SearchOffIcon sx={{ color: "text.disabled", fontSize: 28 }} />
            ) : (
              <SavedSearchIcon sx={{ color: "green", fontSize: 28 }} />
            )}
          </Box>
        </DialogTitle>

        <DialogContent style={{ overflow: "hidden" }}>
          {/* Camera Toggle */}
          {cameras.length > 1 && (
            <Box sx={{ mb: 2 }}>
              <select
                value={selectedCamera || ""}
                onChange={(e) => setSelectedCamera(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  fontSize: "1rem",
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
              width: "100%",
              height: "60%",
            }}
          />

          {/* Display matched item */}
          {matchedProduct && (
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Typography variant="body1">
                Item:{" "}
                <strong>
                  {matchedProduct.Item} ({matchedProduct.SKU})
                </strong>
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          {matchedProduct && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddItem}
              size="small"
            >
              Add Item
            </Button>
          )}
          <Button onClick={onClose} color="secondary" size="small">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stacked Snackbars */}
      {snackbars.map((s, index) => (
        <Snackbar
          key={s.id}
          open
          autoHideDuration={4000}
          onClose={() => handleCloseSnackbar(s.id)}
          anchorOrigin={{ vertical: "top", horizontal: "left" }}
          sx={{ mb: `${index * 56}px` }} // stack each snackbar
        >
          <Alert
            onClose={() => handleCloseSnackbar(s.id)}
            severity={s.severity}
            sx={{ width: "100%" }}
          >
            {s.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
}
