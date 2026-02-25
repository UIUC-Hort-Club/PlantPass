import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Button,
  Stack,
  Divider,
  Alert,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { useNotification } from "../../contexts/NotificationContext";
import LoadingSpinner from "../common/LoadingSpinner";
import { getFeatureToggles } from "../../api/feature_toggles_interface/getFeatureToggles";
import { setFeatureToggles as saveFeatureToggles } from "../../api/feature_toggles_interface/setFeatureToggles";

export default function FeatureToggles() {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [features, setFeatures] = useState({
    collectEmailAddresses: true,
    passwordProtectAdmin: true,
    protectPlantPassAccess: false,
  });

  useEffect(() => {
    loadFeatureToggles();
  }, []);

  const loadFeatureToggles = async () => {
    try {
      setLoading(true);
      const response = await getFeatureToggles();
      setFeatures(response);
    } catch (error) {
      console.error("Error loading feature toggles:", error);
      showError("Failed to load feature toggles");
      // Fall back to localStorage if API fails
      const stored = localStorage.getItem("featureToggles");
      if (stored) {
        setFeatures(JSON.parse(stored));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChange = (featureName) => (event) => {
    setFeatures((prev) => ({
      ...prev,
      [featureName]: event.target.checked,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      try {
        await saveFeatureToggles(features);
      } catch (apiError) {
        console.warn("API save failed, using localStorage only:", apiError);
      }
      
      // Always save to localStorage as backup
      localStorage.setItem("featureToggles", JSON.stringify(features));
      
      // Dispatch event to notify context to refresh
      window.dispatchEvent(new Event("featureTogglesUpdated"));
      
      showSuccess("Feature toggles saved successfully. Refresh the page to see changes.");
    } catch (error) {
      console.error("Error saving feature toggles:", error);
      showError("Failed to save feature toggles");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading feature toggles..." />;
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Feature Toggles
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enable or disable features for the PlantPass application.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Please refresh the page after saving to see changes take effect.
      </Alert>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Email Collection Toggle */}
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={features.collectEmailAddresses}
                  onChange={handleToggleChange("collectEmailAddresses")}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    Collect E-mail Addresses
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    When enabled, customers can provide their email address during checkout.
                    When disabled, email field is hidden and an empty string is recorded.
                  </Typography>
                </Box>
              }
            />
          </Box>

          <Divider />

          {/* Password Protection Toggle */}
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={features.passwordProtectAdmin}
                  onChange={handleToggleChange("passwordProtectAdmin")}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    Password Protect Admin Console
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    When enabled, requires password authentication to access the admin console.
                    When disabled, clicking the Public icon button grants immediate access.
                  </Typography>
                </Box>
              }
            />
          </Box>

          <Divider />

          {/* PlantPass Access Protection Toggle */}
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={features.protectPlantPassAccess}
                  onChange={handleToggleChange("protectPlantPassAccess")}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    Protect PlantPass Access
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    When enabled, users must enter a passphrase to access the PlantPass checkout station.
                    When disabled, anyone can access the checkout station from the home screen.
                  </Typography>
                </Box>
              }
            />
          </Box>
        </Stack>

        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            size="large"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
