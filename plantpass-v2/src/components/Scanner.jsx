import { Modal } from '@mantine/core';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';

export default function Scanner({ opened, onClose, onScan }) {
  useEffect(() => {
    if (opened) {
      const scanner = new Html5QrcodeScanner('scanner', { fps: 10, qrbox: 250 });
      scanner.render(onScan, console.error);
    }
  }, [opened]);

  return (
    <Modal opened={opened} onClose={onClose} title="Scan Barcode">
      <div id="scanner" />
    </Modal>
  );
}