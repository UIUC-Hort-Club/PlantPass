import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getFeatureToggles } from "../api/feature_toggles_interface/getFeatureToggles";
import type { FeatureToggles } from "../types";

interface FeatureToggleContextValue {
  features: FeatureToggles;
  loading: boolean;
  refreshFeatureToggles: () => void;
}

const FeatureToggleContext = createContext<FeatureToggleContextValue | undefined>(undefined);

export function useFeatureToggles(): FeatureToggleContextValue {
  const context = useContext(FeatureToggleContext);
  if (!context) {
    throw new Error("useFeatureToggles must be used within a FeatureToggleProvider");
  }
  return context;
}

interface FeatureToggleProviderProps {
  children: ReactNode;
}

export function FeatureToggleProvider({ children }: FeatureToggleProviderProps): React.ReactElement {
  // Initialize from localStorage first if available
  const getInitialFeatures = (): FeatureToggles => {
    try {
      const stored = localStorage.getItem("featureToggles");
      if (stored) {
        return JSON.parse(stored) as FeatureToggles;
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

  const [features, setFeatures] = useState<FeatureToggles>(getInitialFeatures);
  const [loading, setLoading] = useState<boolean>(true);

  const loadFeatureToggles = async (): Promise<void> => {
    try {
      const response = await getFeatureToggles();
      setFeatures(response);
      // Also cache in localStorage
      localStorage.setItem("featureToggles", JSON.stringify(response));
    } catch {
      // Fall back to localStorage if API fails
      const stored = localStorage.getItem("featureToggles");
      if (stored) {
        const parsed = JSON.parse(stored) as FeatureToggles;
        setFeatures(parsed);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeatureToggles();
    
    // Listen for storage changes (when toggles are saved in other tabs)
    const handleStorageChange = (): void => {
      loadFeatureToggles();
    };
    
    // Listen for custom events (when toggles are saved in same tab)
    const handleFeatureTogglesUpdated = (): void => {
      loadFeatureToggles();
    };

    // Refresh when tab becomes visible (user returns to tab)
    const handleVisibilityChange = (): void => {
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

  const refreshFeatureToggles = (): void => {
    loadFeatureToggles();
  };

  return (
    <FeatureToggleContext.Provider value={{ features, loading, refreshFeatureToggles }}>
      {children}
    </FeatureToggleContext.Provider>
  );
}
