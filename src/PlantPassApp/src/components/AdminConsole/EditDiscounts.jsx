import React, { useState } from "react";
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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function DiscountTable() {
  const defaultRows = [
    { id: "1", name: "Holiday Sale", percent: 10 },
    { id: "2", name: "VIP Discount", percent: 15 },
  ];

  const [rows, setRows] = useState(defaultRows);

  const handleAddRow = () => {
    setRows([...rows, { id: Date.now().toString(), name: "", percent: 0 }]);
  };

  const handleDelete = (id) => {
    setRows(rows.filter((r) => r.id !== id));
  };

  const handleEdit = (id, field, value) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleReset = () => setRows(defaultRows);
  const handleClear = () => setRows([]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const updated = Array.from(rows);
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);

    setRows(updated);
  };

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
            color="error"
            onClick={handleClear}
            sx={{
              backgroundColor: "transparent !important",
              borderColor: "#d32f2f !important",
              color: "#d32f2f !important",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                backgroundColor: "rgba(211, 47, 47, 0.12) !important",
                borderColor: "#b71c1c !important",
                color: "#b71c1c !important",
              },
            }}
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
                              type="number"
                              fullWidth
                              size="small"
                              value={row.percent}
                              onChange={(e) =>
                                handleEdit(row.id, "percent", e.target.value)
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
        <Button variant="contained">Save</Button>
      </Stack>
    </Paper>
  );
}
