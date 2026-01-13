import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6B8E23',      // olive green
      contrastText: '#F5F5F5'
    },
    secondary: {
      main: '#C1DAB3',      // sage green
      contrastText: '#2E4B2B'
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: '#6B8E23',
          color: '#F5F5F5',
          '&:hover': {
            backgroundColor: '#A9BA9D'
          }
        }
      }
    }
  }
});

export default theme;
