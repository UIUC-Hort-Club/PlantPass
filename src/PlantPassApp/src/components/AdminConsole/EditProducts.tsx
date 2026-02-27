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
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { getAllProducts } from "../../api/products_interface/getAllProducts";
import { replaceAllProducts } from "../../api/products_interface/replaceAllProducts";
import { getLockState } from "../../api/lock_interface/getLockState";
import { setLockState } from "../../api/lock_interface/setLockState";
import { useNotification } from "../../contexts/NotificationContext";
import { generateSKU } from "../../utils/skuGenerator";
import { validateSKUs } from "../../utils/skuValidator";
import { formatPriceInput, handlePriceBlur } from "../../utils/priceFormatter";
import LoadingSpinner from "../common/LoadingSpinner";

export default function ProductTable() {
  const { showSuccess, showError, showInfo } = useNotification();
  
  const [rows, setRows] = useState([]);
  const [originalRows, setOriginalRows] = useState([]);
  const [deletedRows, setDeletedRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [duplicateSKUs, setDuplicateSKUs] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [lockLoading, setLockLoading] = useState(false);

  useEffect(() => {
    loadProducts();
    checkLockState();
  }, []);

  useEffect(() => {
    const errors = validateSKUs(rows);
    setDuplicateSKUs(errors);
  }, [rows]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const products = await getAllProducts();
      const formattedRows = products.map((product, index) => ({
        id: `${product.SKU}-${index}`,
        sku: product.SKU,
        name: product.item,
        price: product.price_ea.toFixed(2),
        sortOrder: product.sort_order || index,
        isNew: false,
        originalSku: product.SKU,
      }));
      setRows(formattedRows);
      setOriginalRows(JSON.parse(JSON.stringify(formattedRows)));
      setDeletedRows([]);
    } catch (error) {
      console.error("Error loading products:", error);
      showError("Error loading products");
    } finally {
      setLoading(false);
    }
  };

  const checkLockState = async () => {
    try {
      const response = await getLockState('products');
      setIsLocked(response.isLocked || false);
    } catch (error) {
      console.error("Error checking lock state:", error);
    }
  };

  const toggleLock = async () => {
    try {
      setLockLoading(true);
      const newLockState = !isLocked;
      await setLockState('products', newLockState);
      setIsLocked(newLockState);
      showSuccess(newLockState ? "Products locked" : "Products unlocked");
    } catch (error) {
      console.error("Error toggling lock:", error);
      showError("Error updating lock state");
    } finally {
      setLockLoading(false);
    }
  };

  const handleAddRow = () => {
    const maxSortOrder = Math.max(...rows.map(r => r.sortOrder || 0), 0);
    const newRow = {
      id: `new-${Date.now()}`,
      sku: "",
      name: "",
      price: "0.00",
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
    if (field === 'price') {
      const formattedPrice = formatPriceInput(value);
      setRows(rows.map((r) => (r.id === id ? { ...r, [field]: formattedPrice } : r)));
    } else {
      setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    }
  };

  const handlePriceBlurEvent = (id) => {
    const row = rows.find(r => r.id === id);
    if (!row) return;
    
    const formattedPrice = handlePriceBlur(row.price);
    setRows(rows.map((r) => (r.id === id ? { ...r, price: formattedPrice } : r)));
  };

  const handleSKUBlur = (id) => {
    const row = rows.find(r => r.id === id);
    if (!row) return;

    if ((!row.sku || row.sku.trim() === '') && row.name && row.name.trim() !== '') {
      const generatedSKU = generateSKU(row.name, rows);
      setRows(rows.map((r) => (r.id === id ? { ...r, sku: generatedSKU } : r)));
    }
  };

  const handleNameBlur = (id) => {
    const row = rows.find(r => r.id === id);
    if (!row) return;

    if (row.name && row.name.trim() !== '' && (!row.sku || row.sku.trim() === '')) {
      const generatedSKU = generateSKU(row.name, rows);
      setRows(rows.map((r) => (r.id === id ? { ...r, sku: generatedSKU } : r)));
    }
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
      if (row.isNew) return row.name.trim() !== "" || parseFloat(row.price) !== 0;
      
      const original = originalRows.find(orig => orig.id === row.id);
      if (!original) return true;
      
      return row.name !== original.name || 
             parseFloat(row.price) !== parseFloat(original.price) || 
             row.sku !== original.sku ||
             row.sortOrder !== original.sortOrder;
    });
  };

  const handleSave = async () => {
    if (!hasChanges()) {
      showInfo("No changes to save");
      return;
    }

    // Check current lock state before saving
    try {
      const currentLockState = await getLockState('products');
      if (currentLockState.isLocked) {
        showError("Cannot save: Products have been locked by another admin");
        await loadProducts();
        await checkLockState();
        return;
      }
    } catch (error) {
      console.error("Error checking lock state:", error);
      showError("Error verifying lock state");
      return;
    }

    // Check for validation errors including duplicates
    const validationErrors = validateSKUs(rows);
    if (validationErrors.length > 0) {
      const duplicateErrors = validationErrors.filter(err => err.includes("duplicate"));
      if (duplicateErrors.length > 0) {
        showError(duplicateErrors[0]); // Show the first duplicate error
      } else {
        showError(validationErrors[0]); // Show the first validation error
      }
      return;
    }

    const invalidRows = rows.filter(row => 
      row.name && row.name.trim() !== '' && (!row.sku || row.sku.trim() === '')
    );
    
    if (invalidRows.length > 0) {
      showError("All products must have a SKU");
      return;
    }

    const invalidPrices = rows.filter(row => 
      row.name && row.name.trim() !== '' && (isNaN(parseFloat(row.price)) || parseFloat(row.price) < 0)
    );
    
    if (invalidPrices.length > 0) {
      showError("All products must have a valid price");
      return;
    }

    setSaving(true);
    try {
      const validProducts = rows
        .filter(row => row.name && row.name.trim() !== '' && row.sku && row.sku.trim() !== '')
        .map(row => ({
          SKU: row.sku.toUpperCase(),
          item: row.name,
          price_ea: parseFloat(row.price) || 0,
          sort_order: row.sortOrder
        }));

      await replaceAllProducts(validProducts);

      await loadProducts();
      showSuccess(`Products saved successfully (${validProducts.length} products)`);
    } catch (error) {
      console.error("Error saving products:", error);
      showError("Error saving products");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2 }}>
        <LoadingSpinner message="Loading products..." />
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
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6">Edit Products</Typography>
          <IconButton 
            onClick={toggleLock} 
            disabled={lockLoading}
            size="small"
            sx={{ 
              color: isLocked ? 'error.main' : 'success.main',
              '&:hover': {
                backgroundColor: isLocked ? 'error.light' : 'success.light',
                opacity: 0.1
              }
            }}
          >
            {isLocked ? <LockIcon /> : <LockOpenIcon />}
          </IconButton>
        </Stack>
      </Stack>

      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            disabled={isLocked}
            sx={{
              fontWeight: 200,
              color: "error.dark",
              borderColor: "error.light",
              backgroundColor: "rgba(211, 47, 47, 0.08)",
              borderWidth: 2,
              py: 0.5,
              px: 2,
              minHeight: 32,
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

          <Button 
            variant="outlined" 
            size="small" 
            onClick={handleReset}
            disabled={isLocked}
            sx={{ py: 0.5, px: 2, minHeight: 32 }}
          >
            Reset
          </Button>
        </Stack>

        <Button 
          variant="contained" 
          size="small" 
          onClick={handleAddRow}
          disabled={isLocked}
          sx={{ py: 0.5, px: 2, minHeight: 32 }}
        >
          Add Product
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="products">
            {(provided, snapshot) => (
              <Table
                size="small"
                sx={{ 
                  minWidth: 650,
                  backgroundColor: snapshot.isDraggingOver ? 'rgba(63, 81, 181, 0.04)' : 'inherit',
                  transition: 'background-color 0.2s ease'
                }}
                aria-label="dense editable product table"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: "25%" }}>
                      <strong>SKU</strong>
                    </TableCell>
                    <TableCell sx={{ width: "45%" }}>
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
                                value={row.sku}
                                onChange={(e) =>
                                  handleEdit(row.id, "sku", e.target.value.toUpperCase())
                                }
                                onBlur={() => handleSKUBlur(row.id)}
                                error={duplicateSKUs.some(err => err.includes(row.sku?.toUpperCase()))}
                                helperText={duplicateSKUs.find(err => err.includes(row.sku?.toUpperCase())) || ""}
                                placeholder="Auto-generated"
                                disabled={isLocked}
                              />
                            </Box>
                          </TableCell>

                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              value={row.name}
                              onChange={(e) =>
                                handleEdit(row.id, "name", e.target.value)
                              }
                              onBlur={() => handleNameBlur(row.id)}
                              disabled={isLocked}
                            />
                          </TableCell>

                          <TableCell>
                            <TextField
                              type="text"
                              fullWidth
                              size="small"
                              value={row.price}
                              onChange={(e) =>
                                handleEdit(row.id, "price", e.target.value)
                              }
                              onBlur={() => handlePriceBlurEvent(row.id)}
                              inputProps={{
                                inputMode: 'decimal',
                                pattern: '[0-9]*\\.?[0-9]*'
                              }}
                              disabled={isLocked}
                            />
                          </TableCell>

                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(row.id)}
                              disabled={isLocked}
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
          disabled={!hasChanges() || saving || isLocked}
          sx={{ py: 0.5, px: 2, minHeight: 32 }}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </Stack>
    </Paper>
  );
}
