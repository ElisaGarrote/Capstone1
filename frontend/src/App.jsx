import react from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Accessories from "./pages/Accessories/Accessories";
import CheckinAccessory from "./pages/accessories/CheckinAccessory";
import CheckoutAccessory from "./pages/accessories/CheckoutAccessory";
import AssetAudits from "./pages/asset-audit/AssetAudits";
import OverdueAudits from "./pages/asset-audit/OverdueAudits";
import ScheduledAudits from "./pages/asset-audit/ScheduledAudits";
import CompletedAudits from "./pages/asset-audit/CompletedAudtis";
import AccessoriesRegistration from "./pages/accessories/AccessoriesRegistration";

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/accessories" element={<Accessories />} />
        <Route path="/accessories/checkin" element={<CheckinAccessory />} />
        <Route path="/accessories/checkout" element={<CheckoutAccessory />} />
        <Route path="/audits/" element={<AssetAudits />} />
        <Route path="/audits/overdue" element={<OverdueAudits />} />
        <Route path="/audits/scheduled" element={<ScheduledAudits />} />
        <Route path="/audits/completed" element={<CompletedAudits />} />
        <Route
          path="/accessories/registration"
          element={<AccessoriesRegistration />}
        />
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
