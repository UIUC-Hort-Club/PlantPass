import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import { Html5Qrcode } from "html5-qrcode";
import { useNotification } from "../../../contexts/NotificationContext";

export default function Scanner({
  opened,
  onClose,
  onScan,
  products,
  getQuantity,
}) {
  const { showSuccess, showWarning, showInfo } = useNotification();
  
  const [matchedProduct, setMatchedProduct] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [foundSKUs, setFoundSKUs] = useState(new Set());

  const scannerContainerRef = useRef(null);
  const scannerInstanceRef = useRef(null);

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

          if (!foundSKUs.has(product.SKU)) {
            showSuccess(`Found (${product.SKU}) ${product.Name}`);
            setFoundSKUs((prev) => new Set(prev).add(product.SKU));
          }
        } else {
          setMatchedProduct(null);
          showWarning(`SKU: ${decodedText} Not Found`);
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
  }, [opened, selectedCamera, products, foundSKUs, showSuccess, showWarning]);

  useEffect(() => {
    if (opened) {
      setMatchedProduct(null);
      setFoundSKUs(new Set());
    }
  }, [opened]);

  const handleAddItem = () => {
    if (!matchedProduct) return;

    const newQuantity = (getQuantity(matchedProduct.SKU) || 0) + 1;

    onScan(matchedProduct);

    showInfo(`Added Item: ${matchedProduct.Name} (Qty: ${newQuantity})`);
  };

  return (
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
          <Stack direction="row" spacing={1}>
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
          </Stack>
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
                {matchedProduct.Name} ({matchedProduct.SKU})
              </strong>
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
