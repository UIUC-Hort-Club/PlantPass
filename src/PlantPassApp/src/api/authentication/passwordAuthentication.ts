import { API_URL } from "../config";

interface AuthResponse {
  token: string;
  requires_password_change?: boolean;
}

interface ChangePasswordResponse {
  message: string;
}

interface ApiErrorResponse {
  error?: string;
  status?: number;
}

export async function authenticateAdmin(password: string): Promise<AuthResponse> {
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

  const data = await response.json() as AuthResponse;
  const { token, requires_password_change } = data;

  // Store admin token (not the boolean flag)
  localStorage.setItem("admin_token", token);
  
  // Remove old boolean flags - they're no longer used for authentication
  localStorage.removeItem("admin_auth");
  localStorage.removeItem("plantpass_auth");

  return { token, requires_password_change };
}

export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<ChangePasswordResponse> {
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

  const data = await response.json() as ChangePasswordResponse & ApiErrorResponse;

  if (!response.ok) {
    const error = new Error(data.error || response.statusText) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return data;
}
