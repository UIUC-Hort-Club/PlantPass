import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#EDE4D3",
      contrastText: "#2F3A2E",
    },
    secondary: {
      main: "#C1DAB3",
      contrastText: "#2E4B2B",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: "#6B8E23",
          color: "#F5F5F5",
          "&:hover": {
            backgroundColor: "#A9BA9D",
          },
        },
      },
    },
  },
});

export default theme;
