import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
} from '@mui/material';
import React, { useState } from 'react';
import { changePassword } from '../../api/passwordAuthentication';

function ResetPassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [notificationMessage, setNotificationMessage] = useState({ type: '', text: '' });

  function handleSubmit() {
    if (newPassword !== confirmPassword) {
      setNotificationMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    changePassword(oldPassword, newPassword)
      .then(() => {
        setNotificationMessage({ type: 'success', text: 'Password updated successfully!' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      })
      .catch((err) => {
        setNotificationMessage({ type: 'error', text: err.message || 'Failed to update password. Perhaps your old password is incorrect?' });
      });
  }

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'oldPassword') setOldPassword(value);
    else if (name === 'newPassword') setNewPassword(value);
    else if (name === 'confirmPassword') setConfirmPassword(value);
  }

  return (
    <Box>
      <Typography variant="h6">Reset Password</Typography> 

      <Stack spacing={2} sx={{ mt: 2, maxWidth: 400 }}>
        <TextField
          autoFocus
          fullWidth
          name='oldPassword'
          size='small'
          type="password"
          label="Old Password"
          value={oldPassword}
          onChange={handleChange}
        />

        <div/> {/* Spacer */}

        <TextField
          fullWidth
          name='newPassword'
          size='small'
          type="password"
          label="New Password"
          value={newPassword}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          name='confirmPassword'
          size='small'
          type="password"
          label="Confirm New Password"
          value={confirmPassword}
          onChange={handleChange}
        />

        <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleSubmit}>
          Update Password
        </Button>

        {notificationMessage.type === 'error' && <Alert severity="error">{notificationMessage.text}</Alert>}
        {notificationMessage.type === 'success' && <Alert severity="success">{notificationMessage.text}</Alert>}

      </Stack>
    </Box>
  );
};

export default ResetPassword;