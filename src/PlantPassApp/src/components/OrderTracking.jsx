import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Button,
  Stack,
  TablePagination,
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function OrderTracking() {
  const [orders, setOrders] = useState([]);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    unitsSold: 0,
    topItems: [],
  });

  // Pagination state
  const [page, setPage] = useState(0);
  const rowsPerPage = 20; // max transactions per page

  const generateDummyData = () => {
    const dummyOrders = Array.from({ length: 50 }).map((_, i) => {
      const items = [
        { name: 'Widget A', qty: Math.floor(Math.random() * 5) + 1, price: 10 },
        { name: 'Widget B', qty: Math.floor(Math.random() * 3), price: 15 },
      ].filter((x) => x.qty > 0);

      const total = items.reduce((sum, it) => sum + it.qty * it.price, 0);

      return {
        id: `ORD-${1000 + i}`,
        timestamp: new Date(Date.now() - Math.random() * 3600 * 1000).toLocaleTimeString(),
        items,
        total,
        payment: Math.random() > 0.5 ? 'Card' : 'PayPal',
      };
    });

    setOrders(dummyOrders);

    const totalRevenue = dummyOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = dummyOrders.length;
    const unitsSold = dummyOrders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0),
      0
    );
    const avgOrderValue = totalOrders ? (totalRevenue / totalOrders).toFixed(2) : 0;

    const itemMap = {};
    dummyOrders.forEach((o) => {
      o.items.forEach((i) => {
        if (!itemMap[i.name]) itemMap[i.name] = 0;
        itemMap[i.name] += i.qty;
      });
    });

    const topItems = Object.entries(itemMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, qty]) => ({ name, qty }));

    setMetrics({ totalRevenue, totalOrders, avgOrderValue, unitsSold, topItems });
  };

  useEffect(() => {
    generateDummyData();
  }, []);

  const chartData = {
    labels: orders.map((o) => o.timestamp),
    datasets: [
      {
        label: 'Revenue',
        data: orders.map((o) => o.total),
        borderColor: 'rgba(63, 81, 181, 1)',
        backgroundColor: 'rgba(63, 81, 181, 0.2)',
      },
    ],
  };

  // Pagination handlers
  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header with Refresh */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">Sales Flow Console</Typography>
        <Button variant="contained" color="primary" onClick={generateDummyData}>
          Refresh
        </Button>
      </Stack>

      {/* Metrics cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Total Revenue</Typography>
              <Typography variant="h6">${metrics.totalRevenue.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Order Volume</Typography>
              <Typography variant="h6">{metrics.totalOrders}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Average Order Value</Typography>
              <Typography variant="h6">${metrics.avgOrderValue}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2">Units Sold</Typography>
              <Typography variant="h6">{metrics.unitsSold}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top items */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Top-Selling Items</Typography>
          <ul>
            {metrics.topItems.map((i, idx) => (
              <li key={idx}>
                {i.name}: {i.qty} units
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Revenue chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Revenue Over Time</Typography>
          <Box sx={{ height: 200 }}>
            <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </Box>
        </CardContent>
      </Card>

      {/* Orders table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Order ID</strong></TableCell>
              <TableCell><strong>Timestamp</strong></TableCell>
              <TableCell><strong>Items</strong></TableCell>
              <TableCell><strong>Payment</strong></TableCell>
              <TableCell><strong>Total</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((o) => (
                <TableRow key={o.id}>
                  <TableCell>{o.id}</TableCell>
                  <TableCell>{o.timestamp}</TableCell>
                  <TableCell>{o.items.map((i) => `${i.name} x${i.qty}`).join(', ')}</TableCell>
                  <TableCell>{o.payment}</TableCell>
                  <TableCell>${o.total.toFixed(2)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[rowsPerPage]}
          component="div"
          count={orders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
        />
      </TableContainer>
    </Container>
  );
}

export default OrderTracking;
