import { API_URL } from "../config";

// -------------------------
// Authenticate admin
// -------------------------
export async function authenticateAdmin(password) {
  try {
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
    // Expected response: { token: "<JWT>" }
    const { token } = data;

    // Store token in localStorage for subsequent requests
    localStorage.setItem("admin_token", token);

    return token;
  } catch (error) {
    console.error("Admin login error:", error);
    throw error;
  }
}

// -------------------------
// Change admin password
// -------------------------
export async function changePassword(oldPassword, newPassword) {
  try {
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
  } catch (error) {
    console.error("Change password error:", error);
    throw error;
  }
}
