import react from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Accessories from "./pages/Accessories/Accessories";
import AccessoriesRegistration from "./pages/accessories/AccessoriesRegistration";
import CheckinAccessory from "./pages/accessories/CheckinAccessory";
import CheckoutAccessory from "./pages/accessories/CheckoutAccessory";
import EditAccessories from "./pages/accessories/EditAccessories";
import AssetAudits from "./pages/asset-audit/AssetAudits";
import OverdueAudits from "./pages/asset-audit/OverdueAudits";
import ScheduledAudits from "./pages/asset-audit/ScheduledAudits";
import CompletedAudits from "./pages/asset-audit/CompletedAudtis";
import PerformAudits from "./pages/asset-audit/PerformAudits";
import ScheduleRegistration from "./pages/asset-audit/ScheduleRegistration";
import EditAudits from "./pages/asset-audit/EditAudits";
import ViewAudits from "./pages/asset-audit/ViewAudits";

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
        <Route
          path="/accessories/registration"
          element={<AccessoriesRegistration />}
        />
        <Route path="/accessories/checkin" element={<CheckinAccessory />} />
        <Route path="/accessories/checkout" element={<CheckoutAccessory />} />
        <Route path="/accessories/edit" element={<EditAccessories />} />
        <Route path="/audits/" element={<AssetAudits />} />
        <Route path="/audits/overdue" element={<OverdueAudits />} />
        <Route path="/audits/scheduled" element={<ScheduledAudits />} />
        <Route path="/audits/completed" element={<CompletedAudits />} />
        <Route path="/audits/new" element={<PerformAudits />} />
        <Route path="/audits/schedule" element={<ScheduleRegistration />} />
        <Route path="/audits/edit" element={<EditAudits />} />
        <Route path="/audits/view" element={<ViewAudits />} />
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
