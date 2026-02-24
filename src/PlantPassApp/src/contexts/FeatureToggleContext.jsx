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
    } catch (error) {
      console.error("Error reading from localStorage:", error);
    }
    // Default values
    return {
      collectEmailAddresses: true,
      passwordProtectAdmin: true,
    };
  };

  const [features, setFeatures] = useState(getInitialFeatures);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeatureToggles();
    
    // Listen for storage changes (when toggles are saved)
    const handleStorageChange = () => {
      loadFeatureToggles();
    };
    
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("featureTogglesUpdated", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("featureTogglesUpdated", handleStorageChange);
    };
  }, []);

  const loadFeatureToggles = async () => {
    try {
      const response = await getFeatureToggles();
      console.log("Loaded feature toggles from API:", response);
      setFeatures(response);
      // Also cache in localStorage
      localStorage.setItem("featureToggles", JSON.stringify(response));
    } catch (error) {
      console.error("Error loading feature toggles from API:", error);
      // Fall back to localStorage if API fails
      const stored = localStorage.getItem("featureToggles");
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log("Loaded feature toggles from localStorage:", parsed);
        setFeatures(parsed);
      } else {
        console.log("No feature toggles in localStorage, using defaults");
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshFeatureToggles = () => {
    loadFeatureToggles();
  };

  return (
    <FeatureToggleContext.Provider value={{ features, loading, refreshFeatureToggles }}>
      {children}
    </FeatureToggleContext.Provider>
  );
}
