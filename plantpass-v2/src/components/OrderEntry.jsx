import {
  Table,
  NumberInput,
  Button,
  Checkbox,
  Group,
  Text,
  Notification,
  Stack,
  Title,
} from '@mantine/core';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

function OrderEntry({ api }) {
  const [stockItems, setStockItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [subtotals, setSubtotals] = useState({});
  const [totals, setTotals] = useState({
    subtotal: 0,
    discount: 0,
    grandTotal: 0,
    bloomingStatus: 'Not Applied',
  });
  const [isPerennialPowerhouse, setIsPerennialPowerhouse] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    fetch('/data/stock.json')
      .then((res) => res.json())
      .then((data) => {
        setStockItems(data);
        const initialQuantities = {};
        const initialSubtotals = {};
        data.forEach((item) => {
          initialQuantities[item.SKU] = 0;
          initialSubtotals[item.SKU] = '0.00';
        });
        setQuantities(initialQuantities);
        setSubtotals(initialSubtotals);
      })
      .catch((err) => console.error('Error loading stock.json:', err));
  }, []);

  const handleQuantityChange = (value, sku) => {
    const item = stockItems.find((i) => i.SKU === sku);
    const numericValue = value || 0;
    const subtotal = (numericValue * item.Price).toFixed(2);

    setQuantities((prev) => ({ ...prev, [sku]: numericValue }));
    setSubtotals((prev) => ({ ...prev, [sku]: subtotal }));
  };

  const calculateTotal = () => {
    let subtotal = 0;
    let totalItems = 0;

    stockItems.forEach((item) => {
      const qty = parseFloat(quantities[item.SKU]) || 0;
      subtotal += qty * item.Price;
      totalItems += qty;
    });

    const discountBlooming = totalItems >= 20 ? 0.05 : 0;
    const discountPerennial = isPerennialPowerhouse ? 0.05 : 0;
    const totalDiscountRate = discountBlooming + discountPerennial;
    const totalDiscount = subtotal * totalDiscountRate;
    const grandTotal = subtotal - totalDiscount;

    setTotals({
      subtotal: subtotal.toFixed(2),
      discount: totalDiscount.toFixed(2),
      grandTotal: Math.floor(grandTotal).toFixed(2),
      bloomingStatus: totalItems >= 20 ? 'Automatically Applied' : 'Not Applied',
    });

    const postData = {
      delete_: false,
      transaction_id: uuidv4(),
      timestamp: new Date().toISOString(),
      quantity: totalItems,
      order_total: Math.floor(grandTotal),
    };

    fetch(api, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    })
      .then(() => {
        console.log('Data sent successfully:', postData);
        setShowNotification(true);
      })
      .catch((error) => {
        console.error('Error sending data:', error);
      });
  };

  const handleNewOrder = () => {
    const resetQuantities = {};
    const resetSubtotals = {};
    stockItems.forEach((item) => {
      resetQuantities[item.SKU] = 0;
      resetSubtotals[item.SKU] = '0.00';
    });
    setQuantities(resetQuantities);
    setSubtotals(resetSubtotals);
    setTotals({
      subtotal: 0,
      discount: 0,
      grandTotal: 0,
      bloomingStatus: 'Not Applied',
    });
    setIsPerennialPowerhouse(false);
  };

  const rows = stockItems.map((item) => (
    <tr key={item.SKU}>
      <td>{item.Item}</td>
      <td>${item.Price.toFixed(2)}</td>
      <td>
        <NumberInput
          value={quantities[item.SKU]}
          onChange={(val) => handleQuantityChange(val, item.SKU)}
          min={0}
          hideControls={false}
        />
      </td>
      <td>${subtotals[item.SKU]}</td>
    </tr>
  ));

  return (
    <Stack spacing="md">
      <Title order={3}>Order Entry</Title>

      <Table striped highlightOnHover withColumnBorders>
        <thead>
          <tr>
            <th>Item</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>

      <Group grow>
        <Button onClick={calculateTotal}>Calculate</Button>
        <Button color="red" onClick={handleNewOrder}>
          New Order
        </Button>
      </Group>

      <Text>Subtotal: ${totals.subtotal}</Text>
      <Text>Discount: -${totals.discount}</Text>
      <Text weight={700}>Grand Total: ${totals.grandTotal}</Text>

      {showNotification && (
        <Notification
          title="Order Recorded"
          color="green"
          onClose={() => setShowNotification(false)}
        >
          Your order has been successfully recorded.
        </Notification>
      )}
    </Stack>
  );
}

export default OrderEntry;