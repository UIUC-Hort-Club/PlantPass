import { Table } from '@mantine/core';
import { useEffect, useState } from 'react';

export default function TransactionTable() {
  const [rows, setRows] = useState([]);

  // useEffect(() => {
  //   fetchTransactions().then(setRows);
  // }, []);

  return (
    <Table>
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Timestamp</th>
          <th>Items</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td>{r.id}</td>
            <td>{r.timestamp}</td>
            <td>{r.items}</td>
            <td>${r.total}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}