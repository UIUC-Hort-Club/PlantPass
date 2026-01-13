import React from 'react';
import { Container, Stack, Typography, useTheme, Box } from '@mui/material';

export default function Header() {
  const theme = useTheme();
  const colorScheme = theme.palette.mode;

  const backgroundColor = colorScheme === 'dark' ? '#4B2E83' : '#F6E7FF';
  const textColor = colorScheme === 'dark' ? '#A8E6CF' : '#4AA870';

  return (
    <Container
      sx={{
        backgroundColor,
        borderRadius: '8px',
        padding: '8px 16px',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
      >
        {/* Logo */}
        <Box
          component="img"
          src="hort_club_logo.png"   // update path as needed
          alt="PlantPass logo"
          sx={{
            height: 32,
            width: 32,
            objectFit: 'contain',
          }}
        />

        {/* Title */}
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ color: textColor, margin: 0 }}
        >
          UIUC Hort Club PlantPass
        </Typography>
      </Stack>
    </Container>
  );
}
