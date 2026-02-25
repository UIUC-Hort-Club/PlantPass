import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFeatureToggles } from "../contexts/FeatureToggleContext";
import PlantPassAccessModal from "./Home/PlantPassAccessModal";
import LoadingSpinner from "./common/LoadingSpinner";

export default function ProtectedRoute({ children }) {
  const { features, loading } = useFeatureToggles();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if protection is enabled
    if (!loading) {
      if (!features.protectPlantPassAccess) {
        // Protection disabled, allow access
        setIsAuthenticated(true);
      } else {
        // Check session storage for authentication
        const authenticated = sessionStorage.getItem("plantPassAuthenticated");
        if (authenticated === "true") {
          setIsAuthenticated(true);
        } else {
          // Show modal immediately
          setShowModal(true);
        }
      }
    }
  }, [features.protectPlantPassAccess, loading]);

  const handleSuccess = () => {
    sessionStorage.setItem("plantPassAuthenticated", "true");
    setIsAuthenticated(true);
    setShowModal(false);
  };

  const handleClose = () => {
    // Redirect to home if they close the modal without authenticating
    navigate("/", { replace: true });
  };

  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  // Show modal over a blank/loading state when not authenticated
  if (!isAuthenticated && features.protectPlantPassAccess) {
    return (
      <>
        <LoadingSpinner message="Authenticating..." />
        <PlantPassAccessModal
          open={showModal}
          onClose={handleClose}
          onSuccess={handleSuccess}
        />
      </>
    );
  }

  return children;
}
