import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  Box,
  LinearProgress,
  FormHelperText,
  Link,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PasswordField from "../common/PasswordField";

export default function AdminPasswordModal({ open, onClose, onSubmit, error, onForgotPassword }) {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClose = () => {
    setPassword("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit(password);
      setPassword("");
    } finally {
      setSubmitting(false);
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
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Enter the admin password to continue.
          </Typography>

          <PasswordField
            id="admin-console-password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
            variant="filled"
          />
          <FormHelperText error={Boolean(error)}>
            {error || " "}
          </FormHelperText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, justifyContent: "space-between" }}>
          {onForgotPassword && (
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={(e) => {
                e.preventDefault();
                onForgotPassword();
              }}
              disabled={submitting}
              sx={{ 
                cursor: "pointer",
                color: "text.primary",
                fontWeight: 500,
                textDecoration: "underline",
                "&:hover": {
                  color: "primary.main"
                }
              }}
            >
              Forgot password?
            </Link>
          )}
          
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              onClick={handleClose}
              variant="outlined"
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button type="submit" variant="contained" disabled={submitting}>
              Enter
            </Button>
          </Box>
        </DialogActions>

        {submitting && <LinearProgress />}
      </Box>
    </Dialog>
  );
}
