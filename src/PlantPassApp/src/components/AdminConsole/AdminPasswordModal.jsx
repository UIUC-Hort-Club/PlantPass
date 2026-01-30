import React, { useState } from "react";
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
  LinearProgress,
  FormControl,
  InputLabel,
  FilledInput,
  InputAdornment,
  FormHelperText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function AdminPasswordModal({ open, onClose, onSubmit, error }) {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ===== Password Visibility Toggle Logic ===== */

  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event) => {
    event.preventDefault();
  };

  /* =========================================== */

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
    } catch (err) {
      console.error("Admin authentication error:", err);
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

          <FormControl variant="filled">
            <InputLabel htmlFor="admin-console-password">Password</InputLabel>
            <FilledInput
              id="admin-console-password"
              type={showPassword ? "text" : "password"}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showPassword
                        ? "hide the password"
                        : "display the password"
                    }
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    onMouseUp={handleMouseUpPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              size="small"
              value={password}
              helperText={error}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
            />
            <FormHelperText error={Boolean(error)}>
              {error || " "}
            </FormHelperText>
          </FormControl>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
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
        </DialogActions>

        {submitting && <LinearProgress />}
      </Box>
    </Dialog>
  );
}
