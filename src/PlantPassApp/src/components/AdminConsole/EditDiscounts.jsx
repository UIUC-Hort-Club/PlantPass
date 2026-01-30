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
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import PercentIcon from '@mui/icons-material/Percent';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { getAllDiscounts } from "../../api/discounts_interface/getAllDiscounts";
import { createDiscount } from "../../api/discounts_interface/createDiscount";
import { updateDiscount } from "../../api/discounts_interface/updateDiscount";
import { deleteDiscount } from "../../api/discounts_interface/deleteDiscount";
import { updateDiscountOrder } from "../../api/discounts_interface/updateDiscountOrder";

export default function DiscountTable() {
  const [rows, setRows] = useState([]);
  const [originalRows, setOriginalRows] = useState([]);
  const [deletedRows, setDeletedRows] = useState([]); // Track deleted items
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
        type: discount.type,
        percent: discount.percent_off.toString(),
        value: discount.value_off.toFixed(2),
        sortOrder: discount.sort_order,
        isNew: false,
        originalName: discount.name,
      }));
      setRows(formattedRows);
      setOriginalRows(JSON.parse(JSON.stringify(formattedRows)));
      setDeletedRows([]); // Clear deleted rows when loading fresh data
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
    const maxSortOrder = Math.max(...rows.map(r => r.sortOrder || 0), 0);
    const newRow = {
      id: `new-${Date.now()}`,
      name: "",
      type: "percent",
      percent: "0",
      value: "0.00",
      sortOrder: maxSortOrder + 1,
      isNew: true,
    };
    setRows([...rows, newRow]);
  };

  const handleDelete = (id) => {
    const row = rows.find(r => r.id === id);
    
    if (row.isNew) {
      // Just remove from UI if it's a new row (never saved to database)
      setRows(rows.filter((r) => r.id !== id));
    } else {
      // Mark existing row for deletion and remove from UI
      setDeletedRows(prev => [...prev, row]);
      setRows(rows.filter((r) => r.id !== id));
    }
  };

  const handleEdit = (id, field, value) => {
    if (field === 'percent' || field === 'value') {
      // Handle value formatting for both percent and dollar amounts
      const formattedValue = field === 'percent' ? formatPercentInput(value) : formatValueInput(value);
      setRows(rows.map((r) => (r.id === id ? { ...r, [field]: formattedValue } : r)));
    } else {
      setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    }
  };

  const formatValueInput = (value) => {
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
    
    // Return the cleaned string
    return cleaned;
  };

  const formatValueDisplay = (value) => {
    // Format for display with 2 decimal places
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '0.00';
    return numValue.toFixed(2);
  };

  const handleValueBlur = (id) => {
    const row = rows.find(r => r.id === id);
    if (!row) return;
    
    // Format to 2 decimal places on blur
    const formattedValue = formatValueDisplay(row.value);
    setRows(rows.map((r) => (r.id === id ? { ...r, value: formattedValue } : r)));
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
    setDeletedRows([]); // Clear deleted rows on reset
  };

  const handleClear = () => {
    // Mark all existing rows for deletion, keep only new unsaved rows
    const existingRows = rows.filter(row => !row.isNew);
    setDeletedRows(prev => [...prev, ...existingRows]);
    setRows(rows.filter(row => row.isNew));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const updated = Array.from(rows);
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);

    // Update sort orders based on new positions
    const reorderedRows = updated.map((row, index) => ({
      ...row,
      sortOrder: index + 1
    }));

    setRows(reorderedRows);
  };

  // Check if there are changes to save
  const hasChanges = () => {
    // Check if there are deleted rows
    if (deletedRows.length > 0) return true;
    
    // Check if row count changed (excluding deleted rows)
    if (rows.length !== originalRows.length) return true;
    
    return rows.some(row => {
      if (row.isNew) return row.name.trim() !== "" || parseFloat(row.percent) !== 0 || parseFloat(row.value) !== 0;
      
      const original = originalRows.find(orig => orig.id === row.id);
      if (!original) return true;
      
      return row.name !== original.name || 
             parseFloat(row.percent) !== parseFloat(original.percent) ||
             parseFloat(row.value) !== parseFloat(original.value) ||
             row.type !== original.type ||
             row.sortOrder !== original.sortOrder;
    });
  };

  const handleSave = async () => {
    if (!hasChanges()) {
      showNotification("No changes to save", "info");
      return;
    }

    setSaving(true);
    try {
      // Process deleted discounts first
      for (const deletedDiscount of deletedRows) {
        await deleteDiscount(deletedDiscount.originalName || deletedDiscount.name);
      }

      // Process new discounts
      const newDiscounts = rows.filter(row => row.isNew && row.name.trim() !== "");
      for (const discount of newDiscounts) {
        const discountData = {
          name: discount.name,
          type: discount.type,
          sort_order: discount.sortOrder
        };
        
        if (discount.type === 'percent') {
          discountData.percent_off = parseFloat(discount.percent) || 0;
        } else {
          discountData.value_off = parseFloat(discount.value) || 0;
        }
        
        await createDiscount(discountData);
      }

      // Process updated discounts
      const updatedDiscounts = rows.filter(row => {
        if (row.isNew) return false;
        const original = originalRows.find(orig => orig.id === row.id);
        return original && (row.name !== original.name || 
                           row.percent !== original.percent ||
                           row.value !== original.value ||
                           row.type !== original.type ||
                           row.sortOrder !== original.sortOrder);
      });

      for (const discount of updatedDiscounts) {
        const updateData = {
          type: discount.type,
          sort_order: discount.sortOrder
        };
        
        if (discount.type === 'percent') {
          updateData.percent_off = parseFloat(discount.percent) || 0;
          updateData.value_off = 0; // Clear dollar value when switching to percent
        } else {
          updateData.value_off = parseFloat(discount.value) || 0;
          updateData.percent_off = 0; // Clear percent value when switching to dollar
        }
        
        await updateDiscount(discount.originalName || discount.name, updateData);
      }

      // Update sort orders for all existing discounts if order changed
      const orderChanges = rows.filter(row => {
        if (row.isNew) return false;
        const original = originalRows.find(orig => orig.id === row.id);
        return original && row.sortOrder !== original.sortOrder;
      });

      if (orderChanges.length > 0) {
        const orderUpdates = rows
          .filter(row => !row.isNew)
          .map(row => ({
            name: row.name,
            sort_order: row.sortOrder
          }));
        
        await updateDiscountOrder(orderUpdates);
      }

      // Reload data to get fresh state
      await loadDiscounts();
      showNotification(`Discounts saved successfully${deletedRows.length > 0 ? ` (${deletedRows.length} deleted)` : ''}`);
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
      spacing={1}
        sx={{ mb: 3 }}
      >
        <Typography variant="h6">Edit Discounts</Typography>
        <Typography variant="body1">
          Discounts will resolve from top to bottom. For instance on a $100.00 order
          that qualifies for a 5% discount, a $10.00 discount, another 5% discount,
          and then a $3.00 voucher, it would be as follows: (((100 * 0.95) - 10) * 0.95) - 3 = 77.75
        </Typography>
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
            {(provided, snapshot) => (
              <Table
                size="small"
                sx={{ 
                  minWidth: 650,
                  backgroundColor: snapshot.isDraggingOver ? 'rgba(63, 81, 181, 0.04)' : 'inherit',
                  transition: 'background-color 0.2s ease'
                }}
                aria-label="dense discount table"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: "50%" }}>
                      <strong>Discount Name</strong>
                    </TableCell>
                    <TableCell sx={{ width: "15%" }}>
                      <strong>Type</strong>
                    </TableCell>
                    <TableCell sx={{ width: "20%" }}>
                      <strong>Value</strong>
                    </TableCell>
                    <TableCell sx={{ width: "15%" }}></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rows.map((row, index) => (
                    <Draggable key={row.id} draggableId={row.id} index={index}>
                      {(provided, snapshot) => (
                        <TableRow
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                            backgroundColor: snapshot.isDragging ? 'rgba(63, 81, 181, 0.08)' : 'inherit',
                            boxShadow: snapshot.isDragging ? '0 4px 8px rgba(0,0,0,0.12)' : 'none',
                            transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            }
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                {...provided.dragHandleProps}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  cursor: 'grab',
                                  color: 'text.disabled',
                                  opacity: 0.3,
                                  transition: 'opacity 0.2s ease',
                                  '&:hover': {
                                    opacity: 0.7,
                                    color: 'text.secondary'
                                  },
                                  '&:active': {
                                    cursor: 'grabbing'
                                  }
                                }}
                              >
                                <DragIndicatorIcon fontSize="small" />
                              </Box>
                              <TextField
                                fullWidth
                                size="small"
                                value={row.name}
                                onChange={(e) =>
                                  handleEdit(row.id, "name", e.target.value)
                                }
                              />
                            </Box>
                          </TableCell>

                          <TableCell>
                            <ToggleButtonGroup
                              value={row.type}
                              exclusive
                              onChange={(e, newType) => {
                                if (newType !== null) {
                                  handleEdit(row.id, "type", newType);
                                }
                              }}
                              size="small"
                            >
                              <ToggleButton value="percent" aria-label="percent">
                                <PercentIcon fontSize="small" />
                              </ToggleButton>
                              <ToggleButton value="dollar" aria-label="dollar">
                                <AttachMoneyIcon fontSize="small" />
                              </ToggleButton>
                            </ToggleButtonGroup>
                          </TableCell>

                          <TableCell>
                            <TextField
                              type="text"
                              fullWidth
                              size="small"
                              value={row.type === 'percent' ? row.percent : row.value}
                              onChange={(e) =>
                                handleEdit(row.id, row.type === 'percent' ? 'percent' : 'value', e.target.value)
                              }
                              onBlur={() => {
                                if (row.type === 'percent') {
                                  handlePercentBlur(row.id);
                                } else {
                                  handleValueBlur(row.id);
                                }
                              }}
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
