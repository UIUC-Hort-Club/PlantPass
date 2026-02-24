import { useState, useEffect, useRef, useCallback } from "react";
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
  TableFooter,
  Paper,
  Box,
  Button,
  Stack,
  TablePagination,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TableSortLabel,
  Chip,
  Tooltip as MuiTooltip,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
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
  Filler,
} from "chart.js";
import { fetchSalesAnalytics } from "../../api/transaction_interface/fetchSalesAnalytics";
import { clearAllTransactions } from "../../api/transaction_interface/clearAllTransactions";
import { exportData as exportDataAPI } from "../../api/transaction_interface/exportData";
import { useNotification } from "../../contexts/NotificationContext";
import { useWebSocket } from "../../hooks/useWebSocket";
import { WEBSOCKET_URL } from "../../api/config";
import LoadingSpinner from "../common/LoadingSpinner";
import MetricCard from "./MetricCard";
import ConfirmationDialog from "../common/ConfirmationDialog";
import { formatTimestamp } from "../../utils/dateFormatter";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
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
  const [clearing, setClearing] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showExportInfoDialog, setShowExportInfoDialog] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const rowsPerPage = 20;
  const [orderBy, setOrderBy] = useState('timestamp');
  const [order, setOrder] = useState('desc');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showLive, setShowLive] = useState(false);
  const [liveEnabled, setLiveEnabled] = useState(true);
  const disconnectTimeoutRef = useRef(null);
  const refreshDebounceRef = useRef(null);
  
  const loadAnalytics = useCallback(async (isRefresh = false, isSilent = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError(null);
      const data = await fetchSalesAnalytics();
      
      setAnalytics(data);
      
      if (!lastUpdated) {
        setLastUpdated(new Date());
      }
      
      if (isRefresh && !isSilent) {
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
      if (!isSilent) {
        showError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [lastUpdated, showSuccess, showError]);
  
  const handleWebSocketMessage = useCallback((message) => {
    if (message.type === 'transaction_update') {
      if (refreshDebounceRef.current) {
        clearTimeout(refreshDebounceRef.current);
      }
      
      refreshDebounceRef.current = setTimeout(() => {
        loadAnalytics(true, true);
        setLastUpdated(new Date());
        refreshDebounceRef.current = null;
      }, 2000);
    }
  }, [loadAnalytics]);

  const { isConnected, disconnect, reconnect } = useWebSocket(
    WEBSOCKET_URL,
    handleWebSocketMessage,
    { enabled: liveEnabled && !!WEBSOCKET_URL }
  );

  useEffect(() => {
    if (isConnected && liveEnabled) {
      if (disconnectTimeoutRef.current) {
        clearTimeout(disconnectTimeoutRef.current);
        disconnectTimeoutRef.current = null;
      }
      setShowLive(true);
    } else {
      disconnectTimeoutRef.current = setTimeout(() => {
        setShowLive(false);
      }, 5000);
    }

    return () => {
      if (disconnectTimeoutRef.current) {
        clearTimeout(disconnectTimeoutRef.current);
      }
      if (refreshDebounceRef.current) {
        clearTimeout(refreshDebounceRef.current);
      }
    };
  }, [isConnected, liveEnabled]);

  const handleLiveToggle = () => {
    if (liveEnabled) {
      setLiveEnabled(false);
      disconnect();
      setShowLive(false);
    } else {
      setLiveEnabled(true);
      reconnect();
      loadAnalytics(true, false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const exportData = async () => {
    try {
      const { filename, content, contentType } = await exportDataAPI();
      
      const binaryString = atob(content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showSuccess("Data exported successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      showError("Failed to export data");
    }
  };

  const clearRecords = async () => {
    setShowClearDialog(true);
  };

  const handleClearConfirm = async () => {
    try {
      setClearing(true);
      const result = await clearAllTransactions();
      
      await loadAnalytics();
      
      showSuccess(`Successfully cleared ${result.cleared_count} transaction records`);
    } catch (error) {
      console.error("Error clearing records:", error);
      showError("Failed to clear transaction records");
    } finally {
      setClearing(false);
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

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedTransactions = [...analytics.transactions].sort((a, b) => {
    let aValue, bValue;
    
    switch (orderBy) {
      case 'purchase_id':
        aValue = a.purchase_id;
        bValue = b.purchase_id;
        break;
      case 'timestamp':
        aValue = a.timestamp;
        bValue = b.timestamp;
        break;
      case 'total_quantity':
        aValue = a.total_quantity;
        bValue = b.total_quantity;
        break;
      case 'grand_total':
        aValue = a.grand_total;
        bValue = b.grand_total;
        break;
      case 'paid':
        aValue = (a.paid === true || a.paid === 'true') ? 1 : 0;
        bValue = (b.paid === true || b.paid === 'true') ? 1 : 0;
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) {
      return order === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: { xs: 1, sm: 4 }, mb: { xs: 1, sm: 4 }, px: { xs: 1, sm: 3 } }}>
        <LoadingSpinner message="Loading analytics..." />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: { xs: 1, sm: 4 }, mb: { xs: 1, sm: 4 }, px: { xs: 1, sm: 3 } }}>
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
    <Container maxWidth="lg" sx={{ mt: { xs: 1, sm: 4 }, mb: { xs: 1, sm: 4 }, px: { xs: 1, sm: 3 } }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h6">Sales Flow Dashboard</Typography>
        <MuiTooltip title={showLive ? "Click to disable live updates" : "Click to enable live updates"}>
          <Chip
            label="Live"
            size="small"
            color={showLive ? "success" : "default"}
            variant={showLive ? "filled" : "outlined"}
            onClick={handleLiveToggle}
            sx={{ cursor: 'pointer' }}
          />
        </MuiTooltip>
      </Stack>

      <Grid container spacing={2} sx={{ mb: { xs: 2, sm: 3 } }}>
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

      <Card sx={{ mb: { xs: 2, sm: 3 } }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Revenue Over Time</Typography>
          <Box sx={{ overflowX: 'auto', width: '100%' }}>
            {hasChartData ? (
              <Box sx={{ height: 300, minWidth: 600 }}>
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
          </Box>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'purchase_id'}
                  direction={orderBy === 'purchase_id' ? order : 'asc'}
                  onClick={() => handleRequestSort('purchase_id')}
                >
                  <strong>Order ID</strong>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'timestamp'}
                  direction={orderBy === 'timestamp' ? order : 'asc'}
                  onClick={() => handleRequestSort('timestamp')}
                >
                  <strong>Timestamp</strong>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'total_quantity'}
                  direction={orderBy === 'total_quantity' ? order : 'asc'}
                  onClick={() => handleRequestSort('total_quantity')}
                >
                  <strong>Units</strong>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'grand_total'}
                  direction={orderBy === 'grand_total' ? order : 'asc'}
                  onClick={() => handleRequestSort('grand_total')}
                >
                  <strong>Total</strong>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'paid'}
                  direction={orderBy === 'paid' ? order : 'asc'}
                  onClick={() => handleRequestSort('paid')}
                >
                  <strong>Paid</strong>
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedTransactions
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((transaction) => (
                <TableRow key={transaction.purchase_id}>
                  <TableCell>{transaction.purchase_id}</TableCell>
                  <TableCell>{formatTimestamp(transaction.timestamp)}</TableCell>
                  <TableCell>{transaction.total_quantity}</TableCell>
                  <TableCell>${transaction.grand_total.toFixed(2)}</TableCell>
                  <TableCell>{transaction.paid === true || transaction.paid === 'true' ? 'Yes' : 'No'}</TableCell>
                </TableRow>
              ))}
            {analytics.transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No transactions found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5} sx={{ p: 0, border: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1,
                    px: 2,
                    py: 1,
                  }}
                >
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexWrap: "wrap", gap: 1 }}>
                    {/* Export button with info icon - hidden on mobile */}
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: 'none', sm: 'flex' } }}>
                      <IconButton
                        size="small"
                        onClick={() => setShowExportInfoDialog(true)}
                        sx={{ 
                          backgroundColor: 'info.main',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'info.dark',
                          }
                        }}
                      >
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={exportData}
                      >
                        Export Data
                      </Button>
                    </Stack>

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
                      disabled={clearing}
                    >
                      {clearing ? "Clearing..." : "Clear Records"}
                    </Button>
                  </Stack>

                  <TablePagination
                    rowsPerPageOptions={[rowsPerPage]}
                    component="div"
                    count={sortedTransactions.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    sx={{ border: 0 }}
                  />
                </Box>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      <ConfirmationDialog
        open={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={handleClearConfirm}
        title="Clear All Transaction Records"
        message="This action will permanently delete ALL transaction records and cannot be undone. All sales data, analytics history, and transaction details will be lost forever."
        confirmText="Delete All Records"
        cancelText="Cancel"
        requireTextConfirmation={true}
        confirmationText="DELETE ALL"
        severity="error"
      />

      {/* Export Info Dialog */}
      <Dialog
        open={showExportInfoDialog}
        onClose={() => setShowExportInfoDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Export Data Information</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
            This export will download a ZIP file containing 3 CSV files with all transaction data:
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 1 }}>
              1. transactions.csv
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Summary of each transaction
            </Typography>
            <List dense sx={{ pl: 2 }}>
              <ListItem sx={{ py: 0 }}>
                <ListItemText 
                  primary="• purchase_id, timestamp, subtotal, discount_total, club_voucher, grand_total, payment_method, paid"
                  primaryTypographyProps={{ variant: 'body2', fontFamily: 'monospace' }}
                />
              </ListItem>
            </List>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 1 }}>
              2. transaction_items.csv
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Individual items from each transaction (only items with quantity &gt; 0)
            </Typography>
            <List dense sx={{ pl: 2 }}>
              <ListItem sx={{ py: 0 }}>
                <ListItemText 
                  primary="• purchase_id, timestamp, item_name, sku, quantity, price_ea, line_total"
                  primaryTypographyProps={{ variant: 'body2', fontFamily: 'monospace' }}
                />
              </ListItem>
            </List>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 1 }}>
              3. transaction_discounts.csv
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Discounts applied to each transaction (only discounts with amount_off &gt; 0)
            </Typography>
            <List dense sx={{ pl: 2 }}>
              <ListItem sx={{ py: 0 }}>
                <ListItemText 
                  primary="• purchase_id, timestamp, discount_name, discount_type, discount_value, amount_off"
                  primaryTypographyProps={{ variant: 'body2', fontFamily: 'monospace' }}
                />
              </ListItem>
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportInfoDialog(false)} variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default SalesAnalytics;
