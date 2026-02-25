import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { useNotification } from "../../contexts/NotificationContext";
import LoadingSpinner from "../common/LoadingSpinner";
import { apiRequest } from "../../api/apiClient";

export default function PlantPassAccess() {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passphrase, setPassphrase] = useState("");

  useEffect(() => {
    loadPassphrase();
  }, []);

  const loadPassphrase = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/plantpass-access");
      setPassphrase(data.passphrase || "");
    } catch (error) {
      console.error("Error loading passphrase:", error);
      showError("Failed to load passphrase");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!passphrase.trim()) {
      showError("Passphrase cannot be empty");
      return;
    }

    try {
      setSaving(true);
      await apiRequest("/plantpass-access", {
        method: "PUT",
        body: { passphrase },
      });
      showSuccess("PlantPass passphrase saved successfully");
    } catch (error) {
      console.error("Error saving passphrase:", error);
      showError("Failed to save passphrase");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading PlantPass access settings..." />;
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        PlantPass Access
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Set the passphrase required to access the PlantPass checkout app.
        This restricts access to Hort Club members only.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        When the &quot;Protect PlantPass Access&quot; feature toggle is enabled, users will be
        prompted to enter this passphrase before accessing the checkout app.
      </Alert>

      <Paper sx={{ p: 3 }}>
        <TextField
          fullWidth
          label="PlantPass Passphrase"
          type="text"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          helperText="Enter the passphrase that Hort Club members will use to access PlantPass"
          variant="outlined"
        />

        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving || !passphrase.trim()}
            size="large"
          >
            {saving ? "Saving..." : "Save Passphrase"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
