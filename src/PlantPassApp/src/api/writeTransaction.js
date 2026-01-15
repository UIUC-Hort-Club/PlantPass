import { API_URL } from "./config";

/**
 * 
 * @param {object} transactionData is a json object with the following structure:
 * 
 * @see save_transaction(transaction) in TransactionHandler/database_interface.py
 * for expected structure of transaction object, which includes the items+quantities
 * and voucher data)
 * 
 * {
 *   "timestamp": 0,
 *   "items": [
 *    {
*           "item": "Plant A",
 *          "quantity": 2,
 *          "price_ea": 10.00
 *    },
 *    "voucher": 10     // This is the dollar amount of the voucher, not a percentage
 * }
 * 
 * @returns The full transaction data from the backend, which includes discounts applied, etc.
 */
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