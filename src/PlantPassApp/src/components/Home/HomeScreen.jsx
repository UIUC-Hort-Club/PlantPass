import { Box, Card, CardActionArea, Typography, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import StorefrontIcon from "@mui/icons-material/Storefront";
import SearchIcon from "@mui/icons-material/Search";

export default function HomeScreen() {
  const navigate = useNavigate();

  const handleStaffClick = () => {
    navigate("/plantpass");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #F8F9FA 0%, #E8F5E9 100%)",
        px: 2,
        py: 4,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-50%",
          right: "-20%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(82, 183, 136, 0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "-30%",
          left: "-10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(45, 106, 79, 0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 4,
          }}
        >
          <Box
            component="img"
            src="/plantpass_logo_transp.png"
            alt="PlantPass Logo"
            sx={{
              maxWidth: { xs: 280, sm: 380, md: 450 },
              width: "100%",
              height: "auto",
              filter: "drop-shadow(0px 4px 12px rgba(45, 106, 79, 0.15))",
              animation: "fadeInScale 0.6s ease-out",
              "@keyframes fadeInScale": {
                "0%": {
                  opacity: 0,
                  transform: "scale(0.9)",
                },
                "100%": {
                  opacity: 1,
                  transform: "scale(1)",
                },
              },
            }}
          />
        </Box>

        {/* Question */}
        <Typography
          variant="h4"
          sx={{
            mb: 5,
            fontWeight: 700,
            background: "linear-gradient(135deg, #2D6A4F 0%, #52B788 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textAlign: "center",
            fontSize: { xs: "1.75rem", sm: "2.125rem" },
            animation: "fadeInUp 0.6s ease-out 0.2s both",
            "@keyframes fadeInUp": {
              "0%": {
                opacity: 0,
                transform: "translateY(20px)",
              },
              "100%": {
                opacity: 1,
                transform: "translateY(0)",
              },
            },
          }}
        >
          Who are you?
        </Typography>

        {/* Options */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 3,
            animation: "fadeInUp 0.6s ease-out 0.4s both",
          }}
        >
          {/* Option 1: Staff */}
          <Card
            elevation={0}
            sx={{
              border: "2px solid transparent",
              background: "#FFFFFF",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: "0px 12px 32px rgba(45, 106, 79, 0.2)",
                borderColor: "#52B788",
              },
            }}
          >
            <CardActionArea
              onClick={handleStaffClick}
              sx={{
                p: { xs: 3, sm: 4 },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minHeight: { xs: 200, sm: 240 },
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #2D6A4F 0%, #52B788 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 3,
                  transition: "transform 0.3s ease",
                  ".MuiCardActionArea-root:hover &": {
                    transform: "scale(1.1) rotate(5deg)",
                  },
                }}
              >
                <StorefrontIcon sx={{ fontSize: 40, color: "#FFFFFF" }} />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  textAlign: "center",
                  color: "#212529",
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                }}
              >
                Spring Plant Fair Staff
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  textAlign: "center",
                  color: "#6C757D",
                  fontWeight: 500,
                }}
              >
                Checkout Station
              </Typography>
            </CardActionArea>
          </Card>

          {/* Option 2: Customer */}
          <Card
            elevation={0}
            sx={{
              border: "2px solid transparent",
              background: "#FFFFFF",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: "translateY(-8px)",
                boxShadow: "0px 12px 32px rgba(247, 127, 0, 0.2)",
                borderColor: "#F77F00",
              },
            }}
          >
            <CardActionArea
              onClick={() => navigate("/orders")}
              sx={{
                p: { xs: 3, sm: 4 },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minHeight: { xs: 200, sm: 240 },
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #F77F00 0%, #FCBF49 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 3,
                  transition: "transform 0.3s ease",
                  ".MuiCardActionArea-root:hover &": {
                    transform: "scale(1.1) rotate(-5deg)",
                  },
                }}
              >
                <SearchIcon sx={{ fontSize: 40, color: "#FFFFFF" }} />
              </Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  textAlign: "center",
                  color: "#212529",
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                }}
              >
                Customer
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  textAlign: "center",
                  color: "#6C757D",
                  fontWeight: 500,
                }}
              >
                Order Lookup
              </Typography>
            </CardActionArea>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}
