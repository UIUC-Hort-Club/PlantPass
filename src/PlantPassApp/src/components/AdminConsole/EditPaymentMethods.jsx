import { useState, useEffect } from "react";
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
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { getAllPaymentMethods } from "../../api/payment_methods_interface/getAllPaymentMethods";
import { replaceAllPaymentMethods } from "../../api/payment_methods_interface/replaceAllPaymentMethods";
import { useNotification } from "../../contexts/NotificationContext";
import LoadingSpinner from "../common/LoadingSpinner";

export default function EditPaymentMethods() {
  const { showSuccess, showError, showInfo } = useNotification();
  
  const [rows, setRows] = useState([]);
  const [originalRows, setOriginalRows] = useState([]);
  const [deletedRows, setDeletedRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const methods = await getAllPaymentMethods();
      const formattedRows = methods.map((method, index) => ({
        id: `${method.name}-${index}`,
        name: method.name,
        sortOrder: method.sort_order || index,
        isNew: false,
        originalName: method.name,
      }));
      setRows(formattedRows);
      setOriginalRows(JSON.parse(JSON.stringify(formattedRows)));
      setDeletedRows([]);
    } catch (error) {
      console.error("Error loading payment methods:", error);
      showError("Error loading payment methods");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRow = () => {
    const maxSortOrder = Math.max(...rows.map(r => r.sortOrder || 0), 0);
    const newRow = {
      id: `new-${Date.now()}`,
      name: "",
      sortOrder: maxSortOrder + 1,
      isNew: true,
    };
    setRows([...rows, newRow]);
  };

  const handleDelete = (id) => {
    const row = rows.find(r => r.id === id);
    
    if (row.isNew) {
      setRows(rows.filter((r) => r.id !== id));
    } else {
      setDeletedRows(prev => [...prev, row]);
      setRows(rows.filter((r) => r.id !== id));
    }
  };

  const handleEdit = (id, field, value) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleReset = () => {
    setRows(JSON.parse(JSON.stringify(originalRows)));
    setDeletedRows([]);
  };

  const handleClear = () => {
    const existingRows = rows.filter(row => !row.isNew);
    setDeletedRows(prev => [...prev, ...existingRows]);
    setRows(rows.filter(row => row.isNew));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const updated = Array.from(rows);
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);

    const reorderedRows = updated.map((row, index) => ({
      ...row,
      sortOrder: index + 1
    }));

    setRows(reorderedRows);
  };

  const hasChanges = () => {
    if (deletedRows.length > 0) return true;
    
    if (rows.length !== originalRows.length) return true;
    
    return rows.some(row => {
      if (row.isNew) return row.name.trim() !== "";
      
      const original = originalRows.find(orig => orig.id === row.id);
      if (!original) return true;
      
      return row.name !== original.name || row.sortOrder !== original.sortOrder;
    });
  };

  const handleSave = async () => {
    if (!hasChanges()) {
      showInfo("No changes to save");
      return;
    }

    setSaving(true);
    try {
      const validMethods = rows
        .filter(row => row.name && row.name.trim() !== '')
        .map(row => ({
          name: row.name.trim(),
          sort_order: row.sortOrder
        }));

      await replaceAllPaymentMethods(validMethods);

      await loadPaymentMethods();
      showSuccess(`Payment methods saved successfully (${validMethods.length} methods)`);
    } catch (error) {
      console.error("Error saving payment methods:", error);
      showError("Error saving payment methods");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2 }}>
        <LoadingSpinner message="Loading payment methods..." />
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
        <Typography variant="h6">Edit Payment Methods</Typography>
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
          Add Payment Method
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="payment-methods">
            {(provided, snapshot) => (
              <Table
                size="small"
                sx={{ 
                  minWidth: 650,
                  backgroundColor: snapshot.isDraggingOver ? 'rgba(63, 81, 181, 0.04)' : 'inherit',
                  transition: 'background-color 0.2s ease'
                }}
                aria-label="dense payment methods table"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: "85%" }}>
                      <strong>Payment Method Name</strong>
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
                                placeholder="e.g., Cash, Credit/Debit, Check"
                              />
                            </Box>
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
    </Paper>
  );
}
