import { API_URL } from "../config";

export async function requestPasswordReset() {
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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Password reset request error:", error);
    throw error;
  }
}
