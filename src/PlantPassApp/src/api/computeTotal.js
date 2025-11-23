import { API_URL } from "./config";

export async function computeTotal(customerId = null) {
  try {
    const body = customerId ? { customerId } : {};
    const response = await fetch(`${API_URL}/total`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.total; // numeric total

  } catch (err) {
    console.error("Error computing total:", err);
    throw err;
  }
}