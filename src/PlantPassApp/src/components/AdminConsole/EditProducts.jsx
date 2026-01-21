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

function EditProducts() {

  return (
    <Box>
        {/* Header with Refresh */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h6">Edit Products</Typography>
        </Stack>
    </Box>
  );
}

export default EditProducts;
