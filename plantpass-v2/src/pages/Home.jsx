import React from 'react';
import { Container, Tabs, rem } from '@mantine/core';
import { IconCalculator, IconListDetails } from '@tabler/icons-react';
import OrderEntry from '../components/OrderEntry';
import TransactionTable from '../components/TransactionTable';
import AppHeader from '../components/Header';

const API_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbwr1UOin3Oot7ERF0cgz6xHxwPx2Y6cZ6AVs9U6dfRqdWTG_tzBVkhwvtso6Skx8Q0/exec';

export default function Home() {
  return (
    <Container style={{background:"white", padding: "20px"}}>
      <AppHeader/>
      <div style={{height: "1rem"}}/>

      <Container style={{borderWidth: '10px', borderColor: "black"}}>
        <Tabs defaultValue="first">
        <Tabs.List>
            <Tabs.Tab value="first">First tab</Tabs.Tab>
            <Tabs.Tab value="second">Second tab</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="first">First panel</Tabs.Panel>
        <Tabs.Panel value="second">Second panel</Tabs.Panel>
        </Tabs>     
      </Container>

    </Container>
  );
}