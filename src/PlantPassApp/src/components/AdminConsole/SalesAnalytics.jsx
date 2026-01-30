import { useState, useEffect } from "react";
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
  Alert,
} from "@mui/material";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { fetchSalesAnalytics } from "../../api/transaction_interface/fetchSalesAnalytics";
import { useNotification } from "../../contexts/NotificationContext";
import LoadingSpinner from "../common/LoadingSpinner";
import MetricCard from "./MetricCard";
import { formatTimestamp } from "../../utils/dateFormatter";
import { downloadJSON } from "../../utils/exportUtils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

function SalesAnalytics() {
  const { showSuccess, showError } = useNotification();
  
  const [analytics, setAnalytics] = useState({
    total_sales: 0,
    total_orders: 0,
    total_units_sold: 0,
    average_items_per_order: 0,
    average_order_value: 0,
    sales_over_time: {},
    transactions: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const rowsPerPage = 20;

  const loadAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await fetchSalesAnalytics();
      setAnalytics(data);
      if (isRefresh) {
        showSuccess("Analytics refreshed successfully");
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
      let errorMessage = "Failed to load analytics data";
      
      if (error.message.includes("500")) {
        errorMessage = "Server error - please try again later";
      } else if (error.message.includes("404")) {
        errorMessage = "Analytics endpoint not found";
      } else if (error.message.includes("Failed to fetch")) {
        errorMessage = "Network error - check your connection";
      }
      
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const exportData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://y5kg6dk6p3.execute-api.us-east-1.amazonaws.com'}/transactions/export-data`);
      if (!response.ok) throw new Error('Export failed');
      
      const data = await response.json();
      const filename = `sales-data-${new Date().toISOString().split('T')[0]}.json`;
      downloadJSON(data.export_data, filename);
      
      showSuccess("Data exported successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      showError("Failed to export data");
    }
  };

  const clearRecords = async () => {
    if (!window.confirm("Are you sure you want to clear all transaction records? This action cannot be undone.")) {
      return;
    }
    
    try {
      showError("Clear records functionality not yet implemented");
    } catch (error) {
      console.error("Error clearing records:", error);
      showError("Failed to clear records");
    }
  };

  const hasChartData = analytics.sales_over_time && Object.keys(analytics.sales_over_time).length > 0;
  const chartData = {
    labels: hasChartData ? Object.keys(analytics.sales_over_time).sort() : [],
    datasets: [
      {
        label: "Revenue",
        data: hasChartData ? Object.keys(analytics.sales_over_time)
          .sort()
          .map(key => analytics.sales_over_time[key]) : [],
        borderColor: "rgba(63, 81, 181, 1)",
        backgroundColor: "rgba(63, 81, 181, 0.2)",
        tension: 0.1,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time Period'
        }
      },
      y: {
        beginAtZero: true,
        display: true,
        title: {
          display: true,
          text: 'Revenue ($)'
        },
        ticks: {
          callback: function(value) {
            return '$' + value.toFixed(2);
          }
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return 'Revenue: $' + context.parsed.y.toFixed(2);
          }
        }
      }
    }
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <LoadingSpinner message="Loading analytics..." />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={loadAnalytics}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header with Refresh */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h6">Sales Flow Console</Typography>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => loadAnalytics(true)}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </Stack>

      {/* Metrics cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard 
            title="Total Revenue" 
            value={analytics.total_sales.toFixed(2)} 
            prefix="$" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard 
            title="Order Volume" 
            value={analytics.total_orders} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard 
            title="Average Order Value" 
            value={analytics.average_order_value.toFixed(2)} 
            prefix="$" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard 
            title="Units Sold" 
            value={analytics.total_units_sold} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <MetricCard 
            title="Avg Items/Order" 
            value={analytics.average_items_per_order.toFixed(1)} 
          />
        </Grid>
      </Grid>

      {/* Revenue chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Revenue Over Time</Typography>
          {hasChartData ? (
            <Box sx={{ height: 300 }}>
              <Line
                data={chartData}
                options={chartOptions}
              />
            </Box>
          ) : (
            <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No sales data available for chart
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Orders table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Order ID</strong>
              </TableCell>
              <TableCell>
                <strong>Timestamp</strong>
              </TableCell>
              <TableCell>
                <strong>Units</strong>
              </TableCell>
              <TableCell>
                <strong>Total</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {analytics.transactions
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((transaction) => (
                <TableRow key={transaction.purchase_id}>
                  <TableCell>{transaction.purchase_id}</TableCell>
                  <TableCell>{formatTimestamp(transaction.timestamp)}</TableCell>
                  <TableCell>{transaction.total_quantity}</TableCell>
                  <TableCell>${transaction.grand_total.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            {analytics.transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No transactions found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            {/* Export button (far left) */}
            <Button
              variant="outlined"
              size="small"
              onClick={exportData}
            >
              Export Data
            </Button>

            {/* Clear records button */}
            <Button
              variant="outlined"
              size="small"
              sx={{
                fontWeight: 200,
                color: "error.dark",
                borderColor: "error.light",
                backgroundColor: "rgba(211, 47, 47, 0.08)",
                borderWidth: 2,
                "&:hover": {
                  backgroundColor: "error.main",
                  color: "white",
                  borderColor: "error.main",
                },
              }}
              onClick={clearRecords}
            >
              Clear Records
            </Button>
          </Stack>

          {/* Pagination (right) */}
          <TablePagination
            rowsPerPageOptions={[rowsPerPage]}
            component="div"
            count={analytics.transactions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
          />
        </Box>
      </TableContainer>
    </Container>
  );
}

export default SalesAnalytics;
