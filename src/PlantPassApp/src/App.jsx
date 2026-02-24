import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeScreen from "./components/Home/HomeScreen";
import PlantPassApp from "./components/PlantPass/PlantPassApp";
import CustomerOrderLookup from "./components/CustomerOrderLookup/CustomerOrderLookup";
import { NotificationProvider } from "./contexts/NotificationContext";
import { FeatureToggleProvider } from "./contexts/FeatureToggleContext";

export default function App() {
  return (
    <NotificationProvider>
      <FeatureToggleProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/plantpass" element={<PlantPassApp />} />
            <Route path="/orders" element={<CustomerOrderLookup />} />
          </Routes>
        </Router>
      </FeatureToggleProvider>
    </NotificationProvider>
  );
}
