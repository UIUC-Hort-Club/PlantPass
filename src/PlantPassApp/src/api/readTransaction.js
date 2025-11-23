const API_BASE = ""; // replace with tf outpt

export async function readTransaction(transactionId) {
  if (!transactionId) throw new Error("transactionId is required");

  try {
    const response = await fetch(`${API_BASE}/read`, {
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
