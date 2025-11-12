import './App.css';
import Home from './pages/Home';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';

function App() {
  return (
    <div style={{height: '100vh', minWidth: '80vw'}}>
      <ColorSchemeScript defaultColorScheme="light" />
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{ colorScheme: 'light' }} // ✅ This forces light mode
      >
          <Home />
      </MantineProvider>
    </div>
  );
}

export default App;