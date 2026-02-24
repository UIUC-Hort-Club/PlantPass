import { Box, Card, CardActionArea, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import StorefrontIcon from "@mui/icons-material/Storefront";
import SearchIcon from "@mui/icons-material/Search";

export default function HomeScreen() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
        px: 2,
      }}
    >
      {/* Logo */}
      <Box
        component="img"
        src="/plantpass_logo_transp.png"
        alt="PlantPass Logo"
        sx={{
          maxWidth: { xs: 250, sm: 350, md: 450 },
          width: "100%",
          height: "auto",
          mb: 6,
        }}
      />

      {/* Question */}
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          fontWeight: 500,
          color: "#2e7d32",
          textAlign: "center",
        }}
      >
        Who are you?
      </Typography>

      {/* Options */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 3,
          width: "100%",
          maxWidth: 800,
        }}
      >
        {/* Option 1: Staff */}
        <Card
          sx={{
            flex: 1,
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: 6,
            },
          }}
        >
          <CardActionArea
            onClick={() => navigate("/plantpass")}
            sx={{
              p: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minHeight: 200,
            }}
          >
            <StorefrontIcon
              sx={{ fontSize: 64, color: "#2e7d32", mb: 2 }}
            />
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, mb: 1, textAlign: "center" }}
            >
              Spring Plant Fair Staff
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center" }}
            >
              Checkout Station
            </Typography>
          </CardActionArea>
        </Card>

        {/* Option 2: Customer */}
        <Card
          sx={{
            flex: 1,
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: 6,
            },
          }}
        >
          <CardActionArea
            onClick={() => navigate("/orders")}
            sx={{
              p: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minHeight: 200,
            }}
          >
            <SearchIcon sx={{ fontSize: 64, color: "#2e7d32", mb: 2 }} />
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, mb: 1, textAlign: "center" }}
            >
              Customer
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center" }}
            >
              Order Lookup
            </Typography>
          </CardActionArea>
        </Card>
      </Box>
    </Box>
  );
}
