import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NotificationProvider } from "./contexts/NotificationContext";
import { FeatureToggleProvider } from "./contexts/FeatureToggleContext";
import LoadingSpinner from "./components/common/LoadingSpinner";
import ErrorBoundary from "./components/common/ErrorBoundary";

// Lazy load routes for better performance
const HomeScreen = lazy(() => import("./components/Home/HomeScreen"));
const PlantPassApp = lazy(() => import("./components/PlantPass/PlantPassApp"));
const CustomerOrderLookup = lazy(() => import("./components/CustomerOrderLookup/CustomerOrderLookup"));
const AdminConsolePage = lazy(() => import("./components/AdminConsole/AdminConsolePage"));

export default function App(): React.ReactElement {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <FeatureToggleProvider>
          <Router>
            <Suspense fallback={<LoadingSpinner message="Loading..." />}>
              <Routes>
                <Route path="/" element={<HomeScreen />} />
                <Route path="/plantpass" element={<PlantPassApp />} />
                <Route path="/orders" element={<CustomerOrderLookup />} />
                <Route path="/orders/:orderId" element={<CustomerOrderLookup />} />
                <Route path="/admin-console" element={<AdminConsolePage />} />
              </Routes>
            </Suspense>
          </Router>
        </FeatureToggleProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}
