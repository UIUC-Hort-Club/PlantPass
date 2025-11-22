const SHEETS_API_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

export async function fetchTransactions() {
  const res = await fetch(SHEETS_API_URL);
  return res.json();
}

export async function postTransaction(data) {
  await fetch(SHEETS_API_URL, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
}