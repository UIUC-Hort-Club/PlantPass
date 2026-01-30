import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Button,
  Stack,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { getAllDiscounts } from "../../api/discounts_interface/getAllDiscounts";
import { createDiscount } from "../../api/discounts_interface/createDiscount";
import { updateDiscount } from "../../api/discounts_interface/updateDiscount";
import { deleteDiscount } from "../../api/discounts_interface/deleteDiscount";

export default function DiscountTable() {
  const [rows, setRows] = useState([]);
  const [originalRows, setOriginalRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });

  // Load discounts from API on component mount
  useEffect(() => {
    loadDiscounts();
  }, []);

  const loadDiscounts = async () => {
    try {
      setLoading(true);
      const discounts = await getAllDiscounts();
      const formattedRows = discounts.map((discount, index) => ({
        id: `${discount.name}-${index}`,
        name: discount.name,
        percent: discount.percent_off.toString(),
        isNew: false,
        originalName: discount.name,
      }));
      setRows(formattedRows);
      setOriginalRows(JSON.parse(JSON.stringify(formattedRows)));
    } catch (error) {
      console.error("Error loading discounts:", error);
      showNotification("Error loading discounts", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = "success") => {
    setNotification({ open: true, message, severity });
  };

  const handleAddRow = () => {
    const newRow = {
      id: `new-${Date.now()}`,
      name: "",
      percent: "0",
      isNew: true,
    };
    setRows([...rows, newRow]);
  };

  const handleDelete = async (id) => {
    const row = rows.find(r => r.id === id);
    
    if (row.isNew) {
      // Just remove from UI if it's a new row
      setRows(rows.filter((r) => r.id !== id));
    } else {
      // Delete from database
      try {
        await deleteDiscount(row.originalName || row.name);
        setRows(rows.filter((r) => r.id !== id));
        setOriginalRows(originalRows.filter((r) => r.id !== id));
        showNotification("Discount deleted successfully");
      } catch (error) {
        console.error("Error deleting discount:", error);
        showNotification("Error deleting discount", "error");
      }
    }
  };

  const handleEdit = (id, field, value) => {
    if (field === 'percent') {
      // Handle percent formatting
      const formattedPercent = formatPercentInput(value);
      setRows(rows.map((r) => (r.id === id ? { ...r, [field]: formattedPercent } : r)));
    } else {
      setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    }
  };

  const formatPercentInput = (value) => {
    // Remove any non-digit and non-decimal characters
    let cleaned = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      cleaned = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    // Convert to number and back to ensure valid format
    const numValue = parseFloat(cleaned);
    if (isNaN(numValue)) {
      return '';
    }
    
    // Limit to reasonable percentage (0-100)
    if (numValue > 100) {
      return '100';
    }
    
    // Return the cleaned string
    return cleaned;
  };

  const formatPercentDisplay = (percent) => {
    // Format for display with up to 2 decimal places (remove trailing zeros)
    const numPercent = parseFloat(percent);
    if (isNaN(numPercent)) return '0';
    return numPercent.toString();
  };

  const handlePercentBlur = (id) => {
    const row = rows.find(r => r.id === id);
    if (!row) return;
    
    // Format on blur
    const formattedPercent = formatPercentDisplay(row.percent);
    setRows(rows.map((r) => (r.id === id ? { ...r, percent: formattedPercent } : r)));
  };

  const handleReset = () => {
    setRows(JSON.parse(JSON.stringify(originalRows)));
  };

  const handleClear = () => {
    setRows([]);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const updated = Array.from(rows);
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);

    setRows(updated);
  };

  // Check if there are changes to save
  const hasChanges = () => {
    if (rows.length !== originalRows.length) return true;
    
    return rows.some(row => {
      if (row.isNew) return row.name.trim() !== "" || parseFloat(row.percent) !== 0;
      
      const original = originalRows.find(orig => orig.id === row.id);
      if (!original) return true;
      
      return row.name !== original.name || parseFloat(row.percent) !== parseFloat(original.percent);
    });
  };

  const handleSave = async () => {
    if (!hasChanges()) {
      showNotification("No changes to save", "info");
      return;
    }

    setSaving(true);
    try {
      // Process new discounts
      const newDiscounts = rows.filter(row => row.isNew && row.name.trim() !== "");
      for (const discount of newDiscounts) {
        await createDiscount({
          name: discount.name,
          percent_off: parseFloat(discount.percent) || 0
        });
      }

      // Process updated discounts
      const updatedDiscounts = rows.filter(row => {
        if (row.isNew) return false;
        const original = originalRows.find(orig => orig.id === row.id);
        return original && (row.name !== original.name || row.percent !== original.percent);
      });

      for (const discount of updatedDiscounts) {
        await updateDiscount(discount.originalName || discount.name, {
          percent_off: parseFloat(discount.percent) || 0
        });
      }

      // Reload data to get fresh state
      await loadDiscounts();
      showNotification("Discounts saved successfully");
    } catch (error) {
      console.error("Error saving discounts:", error);
      showNotification("Error saving discounts", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: '200px',
            gap: 2
          }}
        >
          <CircularProgress />
          <Typography>Loading discounts...</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h6">Edit Discounts</Typography>
      </Stack>

      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
        <Stack direction="row" spacing={1}>
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
                borderWidth: 2
              },
            }}
            onClick={handleClear}
          >
            Clear
          </Button>

          <Button variant="outlined" size="small" onClick={handleReset}>
            Reset
          </Button>
        </Stack>

        <Button variant="contained" size="small" onClick={handleAddRow}>
          Add Discount
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="discounts">
            {(provided) => (
              <Table
                size="small"
                sx={{ minWidth: 650 }}
                aria-label="dense discount table"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: "70%" }}>
                      <strong>Discount Name</strong>
                    </TableCell>
                    <TableCell sx={{ width: "25%" }}>
                      <strong>Percent Off</strong>
                    </TableCell>
                    <TableCell sx={{ width: "5%" }}></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rows.map((row, index) => (
                    <Draggable key={row.id} draggableId={row.id} index={index}>
                      {(provided) => (
                        <TableRow
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell {...provided.dragHandleProps}>
                            <TextField
                              fullWidth
                              size="small"
                              value={row.name}
                              onChange={(e) =>
                                handleEdit(row.id, "name", e.target.value)
                              }
                            />
                          </TableCell>

                          <TableCell>
                            <TextField
                              type="text"
                              fullWidth
                              size="small"
                              value={row.percent}
                              onChange={(e) =>
                                handleEdit(row.id, "percent", e.target.value)
                              }
                              onBlur={() => handlePercentBlur(row.id)}
                              inputProps={{
                                inputMode: 'decimal',
                                pattern: '[0-9]*\\.?[0-9]*'
                              }}
                            />
                          </TableCell>

                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(row.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </TableBody>
              </Table>
            )}
          </Droppable>
        </DragDropContext>
      </TableContainer>

      <Stack
        direction="row"
        spacing={1}
        justifyContent="right"
        sx={{ paddingTop: "10px" }}
      >
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={!hasChanges() || saving}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </Stack>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert 
          severity={notification.severity} 
          onClose={() => setNotification({ ...notification, open: false })}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
