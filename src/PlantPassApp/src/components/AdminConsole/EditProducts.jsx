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
  CircularProgress,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { getAllProducts } from "../../api/products_interface/getAllProducts";
import { replaceAllProducts } from "../../api/products_interface/replaceAllProducts";
import { useNotification } from "../../contexts/NotificationContext";

const generateSKU = (itemName, existingProducts) => {
  const prefix = itemName.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase();
  
  if (prefix.length < 2) {
    const paddedPrefix = (prefix + 'XX').slice(0, 2);
    return findNextAvailableNumber(paddedPrefix, existingProducts);
  }
  
  return findNextAvailableNumber(prefix, existingProducts);
};

const findNextAvailableNumber = (prefix, existingProducts) => {
  const existingSKUs = existingProducts
    .map(product => product.sku)
    .filter(sku => sku && sku.startsWith(prefix) && sku.length === 5);
  
  const numbers = existingSKUs
    .map(sku => parseInt(sku.slice(2)))
    .filter(num => !isNaN(num));
  
  let nextNum = 1;
  while (numbers.includes(nextNum)) {
    nextNum++;
  }
  
  return `${prefix}${nextNum.toString().padStart(3, '0')}`;
};

const validateSKUs = (rows) => {
  const skuCounts = {};
  const duplicates = new Set();
  
  rows.forEach(row => {
    if (row.sku && row.sku.trim() !== '' && row.sku !== 'Auto-generated') {
      const sku = row.sku.trim().toUpperCase();
      skuCounts[sku] = (skuCounts[sku] || 0) + 1;
      if (skuCounts[sku] > 1) {
        duplicates.add(sku);
      }
    }
  });
  
  return duplicates;
};

export default function ProductTable() {
  const { showSuccess, showError, showInfo } = useNotification();
  
  const [rows, setRows] = useState([]);
  const [originalRows, setOriginalRows] = useState([]);
  const [deletedRows, setDeletedRows] = useState([]); // Track deleted items
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [duplicateSKUs, setDuplicateSKUs] = useState(new Set());

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const duplicates = validateSKUs(rows);
    setDuplicateSKUs(duplicates);
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
      console.error("Error loading products:", error);
      showError("Error loading products");
    } finally {
      setLoading(false);
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

  const formatPriceInput = (value) => {
    let cleaned = value.replace(/[^\d.]/g, '');
    
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    
    if (parts.length === 2 && parts[1].length > 2) {
      cleaned = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    const numValue = parseFloat(cleaned);
    if (isNaN(numValue)) {
      return '';
    }
    
    return cleaned;
  };

  const formatPriceDisplay = (price) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return '0.00';
    return numPrice.toFixed(2);
  };

  const handlePriceBlur = (id) => {
    const row = rows.find(r => r.id === id);
    if (!row) return;
    
    const formattedPrice = formatPriceDisplay(row.price);
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

    if (duplicateSKUs.size > 0) {
      showError("Please fix duplicate SKUs before saving");
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
          <Typography>Loading products...</Typography>
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
                                error={duplicateSKUs.has(row.sku?.toUpperCase())}
                                helperText={duplicateSKUs.has(row.sku?.toUpperCase()) ? "Duplicate SKU Found" : ""}
                                placeholder="Auto-generated"
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
                              onBlur={() => handlePriceBlur(row.id)}
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
    </Paper>
  );
}
