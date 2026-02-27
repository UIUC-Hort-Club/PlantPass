import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  AlertColor,
  LinearProgress,
} from "@mui/material";
import { changePassword } from "../../api/authentication/passwordAuthentication";
import PasswordField from "../common/PasswordField";

function ResetPassword({ requiresPasswordChange, onPasswordChanged }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notificationMessage, setNotificationMessage] = useState<{
    type: AlertColor | "";
    text: string;
  }>({
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
        
        // Notify parent that password was changed
        if (onPasswordChanged) {
          onPasswordChanged();
        }
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
    setNotificationMessage({ type: "", text: "" });
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6">Reset Password</Typography>
      
      {requiresPasswordChange && (
        <Alert severity="warning" sx={{ mt: 2, maxWidth: 600 }}>
          You are using a temporary password. Please set a new permanent password below.
          You can skip entering the old password.
        </Alert>
      )}

      <Stack spacing={2} sx={{ mt: 2, maxWidth: 400 }}>
        {!requiresPasswordChange && (
          <PasswordField
            id="old-password"
            label="Old Password"
            value={oldPassword}
            onChange={handleChange(setOldPassword)}
          />
        )}

        {!requiresPasswordChange && <div />}

        <PasswordField
          id="new-password"
          label="New Password"
          value={newPassword}
          onChange={handleChange(setNewPassword)}
        />

        <PasswordField
          id="confirm-password"
          label="Confirm New Password"
          value={confirmPassword}
          onChange={handleChange(setConfirmPassword)}
        />

        <Button type="submit" variant="contained" disabled={submitting}>
          Update Password
        </Button>

        {submitting && <LinearProgress />}

        {notificationMessage.type && (
          <Alert severity={notificationMessage.type as AlertColor}>
            {notificationMessage.text}
          </Alert>
        )}
      </Stack>
    </Box>
  );
}

export default ResetPassword;
