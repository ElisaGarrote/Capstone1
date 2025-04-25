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
import AssetAudits from "./pages/asset-audit/AssetAudits";
import OverdueAudits from "./pages/asset-audit/OverdueAudits";
import ScheduledAudits from "./pages/asset-audit/ScheduledAudits";
import CompletedAudits from "./pages/asset-audit/CompletedAudtis";
import PerformAudits from "./pages/asset-audit/PerformAudits";
import ScheduleRegistration from "./pages/asset-audit/ScheduleRegistration";
import UpcomingEndOfLife from "./pages/UpcomingEndOfLife";
import ExpiringWarranties from "./pages/ExpiringWarranties";
import ReachedEndOfLife from "./pages/ReachedEndOfLife";
import ExpiredWarranties from "./pages/ExpiredWarranties";
import AssetReport from "./pages/reports/AssetReport";
import DepreciationReport from "./pages/reports/DepreciationReport";
import DueBackReport from "./pages/reports/DueBackReport";
import EndOfLifeWarrantyReport from "./pages/reports/EndOfLifeWarrantyReport";
import ActivityReport from "./pages/reports/ActivityReport";
import Settings from "./pages/Settings";
import UserManagement from "./pages/UserManagement";

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
        <Route path="/audits/" element={<AssetAudits />} />
        <Route path="/audits/overdue" element={<OverdueAudits />} />
        <Route path="/audits/scheduled" element={<ScheduledAudits />} />
        <Route path="/audits/completed" element={<CompletedAudits />} />
        <Route path="/audits/new" element={<PerformAudits />} />
        <Route path="/audits/schedule" element={<ScheduleRegistration />} />
        <Route path="/upcoming-end-of-life" element={<UpcomingEndOfLife />} />
        <Route path="/warranties" element={<ExpiringWarranties />} />
        <Route path="/reached-end-of-life" element={<ReachedEndOfLife />} />
        <Route path="/expired-warranties" element={<ExpiredWarranties />} />
        <Route path="/reports/asset" element={<AssetReport />} />
        <Route path="/reports/depreciation" element={<DepreciationReport />} />
        <Route path="/reports/due-back" element={<DueBackReport />} />
        <Route path="/reports/eol-warranty" element={<EndOfLifeWarrantyReport />} />
        <Route path="/reports/activity" element={<ActivityReport />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
