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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { getAllProducts } from "../../api/products_interface/getAllProducts";
import { createProduct } from "../../api/products_interface/createProduct";
import { updateProduct } from "../../api/products_interface/updateProduct";
import { deleteProduct } from "../../api/products_interface/deleteProduct";

export default function ProductTable() {
  const [rows, setRows] = useState([]);
  const [originalRows, setOriginalRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });

  // Load products from API on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const products = await getAllProducts();
      const formattedRows = products.map((product, index) => ({
        id: `${product.SKU}-${index}`,
        sku: product.SKU,
        name: product.item,
        price: product.price_ea,
        isNew: false,
        originalSku: product.SKU,
      }));
      setRows(formattedRows);
      setOriginalRows(JSON.parse(JSON.stringify(formattedRows)));
    } catch (error) {
      console.error("Error loading products:", error);
      showNotification("Error loading products", "error");
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
      sku: "Auto-generated",
      name: "",
      price: 0,
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
        await deleteProduct(row.originalSku || row.sku);
        setRows(rows.filter((r) => r.id !== id));
        setOriginalRows(originalRows.filter((r) => r.id !== id));
        showNotification("Product deleted successfully");
      } catch (error) {
        console.error("Error deleting product:", error);
        showNotification("Error deleting product", "error");
      }
    }
  };

  const handleEdit = (id, field, value) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
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
      if (row.isNew) return row.name.trim() !== "" || row.price !== 0;
      
      const original = originalRows.find(orig => orig.id === row.id);
      if (!original) return true;
      
      return row.name !== original.name || row.price !== original.price;
    });
  };

  const handleSave = async () => {
    if (!hasChanges()) {
      showNotification("No changes to save", "info");
      return;
    }

    setSaving(true);
    try {
      // Process new products
      const newProducts = rows.filter(row => row.isNew && row.name.trim() !== "");
      for (const product of newProducts) {
        await createProduct({
          item: product.name,
          price_ea: parseFloat(product.price) || 0
        });
      }

      // Process updated products
      const updatedProducts = rows.filter(row => {
        if (row.isNew) return false;
        const original = originalRows.find(orig => orig.id === row.id);
        return original && (row.name !== original.name || row.price !== original.price);
      });

      for (const product of updatedProducts) {
        await updateProduct(product.originalSku || product.sku, {
          item: product.name,
          price_ea: parseFloat(product.price) || 0
        });
      }

      // Reload data to get fresh state
      await loadProducts();
      showNotification("Products saved successfully");
    } catch (error) {
      console.error("Error saving products:", error);
      showNotification("Error saving products", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography>Loading products...</Typography>
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
        <Typography variant="h6">Edit Products</Typography>
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
          Add Product
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="products">
            {(provided) => (
              <Table
                size="small"
                sx={{ minWidth: 650 }}
                aria-label="dense editable product table"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: "20%" }}>
                      <strong>SKU</strong>
                    </TableCell>
                    <TableCell sx={{ width: "50%" }}>
                      <strong>Product Name</strong>
                    </TableCell>
                    <TableCell sx={{ width: "25%" }}>
                      <strong>Unit Price</strong>
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
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              value={row.sku}
                              disabled={true}
                              sx={{ 
                                "& .MuiInputBase-input.Mui-disabled": {
                                  WebkitTextFillColor: "#666",
                                }
                              }}
                            />
                          </TableCell>

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
                              type="number"
                              fullWidth
                              size="small"
                              value={row.price}
                              onChange={(e) =>
                                handleEdit(row.id, "price", e.target.value)
                              }
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
