import { API_URL } from "../config";

export async function authenticateAdmin(password) {
  const response = await fetch(`${API_URL}/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    throw new Error("Authentication failed");
  }

  const data = await response.json();
  const { token, requires_password_change } = data;

  // Store admin token (not the boolean flag)
  localStorage.setItem("admin_token", token);
  
  // Remove old boolean flags - they're no longer used for authentication
  localStorage.removeItem("admin_auth");
  localStorage.removeItem("plantpass_auth");

  return { token, requires_password_change };
}

export async function changePassword(oldPassword, newPassword) {
  const token = localStorage.getItem("admin_token");
  if (!token) throw new Error("Admin not authenticated");

  const response = await fetch(`${API_URL}/admin/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || response.statusText);
    error.status = response.status;
    throw error;
  }

  return data;
}
