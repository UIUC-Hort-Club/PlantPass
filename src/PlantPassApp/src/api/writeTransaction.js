export const API_URL = "https://y5kg6dk6p3.execute-api.us-east-1.amazonaws.com/";

export async function writeTransaction(transactionData) {
  try {
    const response = await fetch(`${API_URL}/write`, {
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