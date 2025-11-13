import React from 'react';
import { Container, Stack, Typography, useTheme } from '@mui/material';

export default function Header() {
  const theme = useTheme();
  const colorScheme = theme.palette.mode;

  const backgroundColor = colorScheme === 'dark' ? '#4B2E83' : '#F6E7FF';
  const textColor = colorScheme === 'dark' ? '#A8E6CF' : '#4AA870';

  return (
    <Container
      sx={{
        backgroundColor,
        borderRadius: '12px',
        padding: '20px',
      }}
    >
      <Stack alignItems="center" justifyContent="flex-start" spacing={1}>
        <Typography variant="h3" fontWeight={500} sx={{ color: textColor, margin: 0 }}>
          PlantPass
        </Typography>
        <Typography variant="h5" fontWeight={300} sx={{ color: textColor, margin: 0 }}>
          Spring Plant Fair 2026
        </Typography>
      </Stack>
    </Container>
  );
}