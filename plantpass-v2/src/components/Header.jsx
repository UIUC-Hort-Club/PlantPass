import React from 'react';
import { Container, Stack, Title, Text, useMantineColorScheme } from '@mantine/core';

export default function Header() {
  const { colorScheme } = useMantineColorScheme();

  const backgroundColor = colorScheme === 'dark' ? '#4B2E83' : '#F6E7FF';
  const textColor = colorScheme === 'dark' ? '#A8E6CF' : '#4AA870';

  return (
    <Container
      style={{
        background: backgroundColor,
        borderRadius: '12px',
        padding: '20px',
      }}
    >
      <Stack align="center" justify="flex-start" gap="xs"> {/* 👈 Reduced gap */}
        <Title order={1} fw={500} style={{ color: textColor, margin: "0px" }}>
          PlantPass
        </Title>
        <Title order={2} fw={300} style={{ color: textColor, margin: "0px"  }}>
          Spring Plant Fair 2026
        </Title>
      </Stack>
    </Container>
  );
}