import { API_URL } from "../config";

interface PasswordResetResponse {
  message: string;
}

export async function requestPasswordReset(): Promise<PasswordResetResponse> {
  try {
    const response = await fetch(`${API_URL}/admin/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to request password reset");
    }

    const data = await response.json() as PasswordResetResponse;
    return data;
  } catch (error) {
    console.error("Password reset request error:", error);
    throw error;
  }
}
