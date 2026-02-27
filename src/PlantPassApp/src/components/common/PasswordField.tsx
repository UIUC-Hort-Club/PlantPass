import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  OutlinedInput,
  FilledInput,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function PasswordField({
  id,
  label,
  value,
  onChange,
  size = "small",
  fullWidth = true,
  variant = "outlined",
  ...props
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  size?: "small" | "medium";
  fullWidth?: boolean;
  variant?: "outlined" | "filled" | "standard";
  [key: string]: unknown;
}) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const InputComponent = variant === "filled" ? FilledInput : OutlinedInput;

  return (
    <FormControl variant={variant} fullWidth={fullWidth} size={size}>
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <InputComponent
        id={id}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              onClick={togglePasswordVisibility}
              edge="end"
              aria-label={showPassword ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        }
        label={label}
        {...props}
      />
    </FormControl>
  );
}