import { createContext, useContext, useState, useEffect } from "react";
import { getFeatureToggles } from "../api/feature_toggles_interface/getFeatureToggles";

const FeatureToggleContext = createContext();

export function useFeatureToggles() {
  const context = useContext(FeatureToggleContext);
  if (!context) {
    throw new Error("useFeatureToggles must be used within a FeatureToggleProvider");
  }
  return context;
}

export function FeatureToggleProvider({ children }) {
  // Initialize from localStorage first if available
  const getInitialFeatures = () => {
    try {
      const stored = localStorage.getItem("featureToggles");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Silently fall back to defaults
    }
    // Default values
    return {
      collectEmailAddresses: true,
      passwordProtectAdmin: true,
      protectPlantPassAccess: false,
    };
  };

  const [features, setFeatures] = useState(getInitialFeatures);
  const [loading, setLoading] = useState(true);

  const loadFeatureToggles = async () => {
    try {
      const response = await getFeatureToggles();
      setFeatures(response);
      // Also cache in localStorage
      localStorage.setItem("featureToggles", JSON.stringify(response));
    } catch {
      // Fall back to localStorage if API fails
      const stored = localStorage.getItem("featureToggles");
      if (stored) {
        const parsed = JSON.parse(stored);
        setFeatures(parsed);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeatureToggles();
    
    // Listen for storage changes (when toggles are saved in other tabs)
    const handleStorageChange = () => {
      loadFeatureToggles();
    };
    
    // Listen for custom events (when toggles are saved in same tab)
    const handleFeatureTogglesUpdated = () => {
      loadFeatureToggles();
    };

    // Refresh when tab becomes visible (user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadFeatureToggles();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("featureTogglesUpdated", handleFeatureTogglesUpdated);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("featureTogglesUpdated", handleFeatureTogglesUpdated);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const refreshFeatureToggles = () => {
    loadFeatureToggles();
  };

  return (
    <FeatureToggleContext.Provider value={{ features, loading, refreshFeatureToggles }}>
      {children}
    </FeatureToggleContext.Provider>
  );
}
