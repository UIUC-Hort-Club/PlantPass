export const API_URL = "https://y5kg6dk6p3.execute-api.us-east-1.amazonaws.com/";

export async function readTransaction(transactionId) {
  if (!transactionId) throw new Error("transactionId is required");

  try {
    const response = await fetch(`${API_URL}/read`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data; // transaction object

  } catch (err) {
    console.error("Error reading transaction:", err);
    throw err;
  }
}
