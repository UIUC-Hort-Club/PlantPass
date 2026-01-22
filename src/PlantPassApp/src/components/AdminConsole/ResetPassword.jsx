import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  LinearProgress,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { changePassword } from "../../api/authentication/passwordAuthentication";

function ResetPassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState({
    type: "",
    text: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setNotificationMessage({
        type: "error",
        text: "New passwords do not match",
      });
      return;
    }

    setSubmitting(true);

    changePassword(oldPassword, newPassword)
      .then(() => {
        setNotificationMessage({
          type: "success",
          text: "Password updated successfully!",
        });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      })
      .catch((err) => {
        setNotificationMessage({
          type: "error",
          text: err.message || "Failed to update password.",
        });
      })
      .finally(() => setSubmitting(false));
  };

  const handleChange = (setter) => (e) => {
    setter(e.target.value);
    setNotificationMessage({ type: "", text: "" }); // clear previous messages on typing
  };

  const toggleShow = (setter, value) => () => setter(!value);

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6">Reset Password</Typography>

      <Stack spacing={2} sx={{ mt: 2, maxWidth: 400 }}>
        {/* Old Password */}
        <FormControl variant="outlined" fullWidth size="small">
          <InputLabel htmlFor="old-password">Old Password</InputLabel>
          <OutlinedInput
            id="old-password"
            type={showOld ? "text" : "password"}
            value={oldPassword}
            onChange={handleChange(setOldPassword)}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={toggleShow(setShowOld, showOld)}
                  edge="end"
                  aria-label={
                    showOld ? "Hide old password" : "Show old password"
                  }
                >
                  {showOld ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Old Password"
          />
        </FormControl>

        <div />

        {/* New Password */}
        <FormControl variant="outlined" fullWidth size="small">
          <InputLabel htmlFor="new-password">New Password</InputLabel>
          <OutlinedInput
            id="new-password"
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={handleChange(setNewPassword)}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={toggleShow(setShowNew, showNew)}
                  edge="end"
                  aria-label={
                    showNew ? "Hide new password" : "Show new password"
                  }
                >
                  {showNew ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="New Password"
          />
        </FormControl>

        {/* Confirm Password */}
        <FormControl variant="outlined" fullWidth size="small">
          <InputLabel htmlFor="confirm-password">
            Confirm New Password
          </InputLabel>
          <OutlinedInput
            id="confirm-password"
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={handleChange(setConfirmPassword)}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={toggleShow(setShowConfirm, showConfirm)}
                  edge="end"
                  aria-label={
                    showConfirm
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirm ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Confirm New Password"
          />
        </FormControl>

        <Button type="submit" variant="contained" disabled={submitting}>
          Update Password
        </Button>

        {submitting && <LinearProgress />}

        {notificationMessage.type && (
          <Alert severity={notificationMessage.type}>
            {notificationMessage.text}
          </Alert>
        )}
      </Stack>
    </Box>
  );
}

export default ResetPassword;
