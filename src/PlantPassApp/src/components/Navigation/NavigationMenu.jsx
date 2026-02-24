import React from "react";
import { Menu, MenuItem } from "@mui/material";

const USER_MENU = ["Entry", "Lookup"];

const ADMIN_MENU = [
  "View Analytics",
  "Edit Products",
  "Edit Discounts",
  "Edit Payment Methods",
  "Feature Toggles",
  "Reset Password",
];

export default function NavigationMenu({
  anchorEl,
  open,
  onClose,
  isAdmin,
  onNavigate,
}) {
  const menuItems = isAdmin ? ADMIN_MENU : USER_MENU;

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      {menuItems.map((label, index) => (
        <MenuItem
          key={label}
          onClick={() => {
            onNavigate(index);
            onClose();
          }}
        >
          {label}
        </MenuItem>
      ))}
    </Menu>
  );
}
