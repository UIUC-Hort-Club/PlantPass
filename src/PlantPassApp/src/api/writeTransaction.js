const API_BASE = ""; // replace with tf outpt

export async function writeTransaction(transactionData) {
  try {
    const response = await fetch(`${API_BASE}/write`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data; // { message: "Transaction recorded" }

  } catch (err) {
    console.error("Error writing transaction:", err);
    throw err;
  }
}