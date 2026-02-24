import { useFeatureToggles } from "../../contexts/FeatureToggleContext";
import { Paper, Typography } from "@mui/material";

/**
 * Temporary debug component to display feature toggle state
 * Add this to any page to see current feature toggle values
 * Remove before production deployment
 */
export default function FeatureToggleDebug() {
  const { features, loading } = useFeatureToggles();

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 16, 
        right: 16, 
        p: 2, 
        zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: 'white',
        minWidth: 250
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
        Feature Toggles Debug
      </Typography>
      <Typography variant="caption" sx={{ display: 'block' }}>
        Loading: {loading ? 'Yes' : 'No'}
      </Typography>
      <Typography variant="caption" sx={{ display: 'block' }}>
        Email Collection: {features.collectEmailAddresses ? 'ON' : 'OFF'}
      </Typography>
      <Typography variant="caption" sx={{ display: 'block' }}>
        Password Protect: {features.passwordProtectAdmin ? 'ON' : 'OFF'}
      </Typography>
      <Typography variant="caption" sx={{ display: 'block', mt: 1, fontSize: '0.65rem' }}>
        localStorage: {localStorage.getItem('featureToggles') || 'not set'}
      </Typography>
    </Paper>
  );
}
