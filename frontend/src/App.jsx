import React from "react";
import react from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ChatBot from "./components/ChatBot";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Assets/Products";
import ProductsRegistration from "./pages/Assets/ProductsRegistration";
import Assets from "./pages/Assets/Assets";
import AssetsRegistration from "./pages/Assets/AssetsRegistration";
import CheckInAsset from "./pages/Assets/CheckInAsset";
import CheckOutAsset from "./pages/Assets/CheckOutAsset";
import Accessories from "./pages/Accessories/Accessories";
import AccessoriesRegistration from "./pages/accessories/AccessoriesRegistration";
import CheckinAccessory from "./pages/accessories/CheckinAccessory";
import CheckoutAccessory from "./pages/accessories/CheckoutAccessory";
import EditAccessories from "./pages/accessories/EditAccessories";
import Components from "./pages/Components/Components";
import CheckOutComponent from "./pages/Components/CheckOutComponent";
import CheckedOutList from "./pages/Components/CheckedOutList";
import CheckInComponent from "./pages/Components/CheckInComponent";
import ComponentsRegistration from "./pages/Components/ComponentsRegistration";
import AssetAudits from "./pages/asset-audit/AssetAudits";
import OverdueAudits from "./pages/asset-audit/OverdueAudits";
import ScheduledAudits from "./pages/asset-audit/ScheduledAudits";
import CompletedAudits from "./pages/asset-audit/CompletedAudtis";
import PerformAudits from "./pages/asset-audit/PerformAudits";
import ScheduleRegistration from "./pages/asset-audit/ScheduleRegistration";
import EditAudits from "./pages/asset-audit/EditAudits";
import ViewAudits from "./pages/asset-audit/ViewAudits";
import Maintenance from "./pages/Repair/Maintenance";
import MaintenanceRegistration from "./pages/Repair/MaintenanceRegistration";
import EditMaintenance from "./pages/Repair/EditMaintenance";
import Consumables from "./pages/Consumables/Consumables";
import PasswordResetRequest from "./pages/PasswordResetRequest";
import PasswordReset from "./pages/PasswordReset";
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
      <ChatBot />
      <Routes>
        {/* <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        /> */}
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/request/password_reset"
          element={<PasswordResetRequest />}
        />
        <Route path="/password-reset/:token" element={<PasswordReset />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route
          path="/products/registration"
          element={<ProductsRegistration />}
        />
        <Route
          path="/products/registration/:id"
          element={<ProductsRegistration />}
        />
        <Route path="/assets" element={<Assets />} />
        <Route path="/assets/registration" element={<AssetsRegistration />} />
        <Route
          path="/assets/registration/:id"
          element={<AssetsRegistration />}
        />
        <Route path="/assets/check-in/:id" element={<CheckInAsset />} />
        <Route path="/assets/check-out/:id" element={<CheckOutAsset />} />
        <Route path="/accessories" element={<Accessories />} />
        <Route
          path="/accessories/registration"
          element={<AccessoriesRegistration />}
        />
        <Route path="/accessories/checkin" element={<CheckinAccessory />} />
        <Route path="/accessories/checkout" element={<CheckoutAccessory />} />
        <Route path="/accessories/edit" element={<EditAccessories />} />
        <Route path="/components" element={<Components />} />
        <Route
          path="/components/check-out/:id"
          element={<CheckOutComponent />}
        />
        <Route
          path="/components/checked-out-list/:id"
          element={<CheckedOutList />}
        />
        <Route path="/components/check-in/:id" element={<CheckInComponent />} />
        <Route
          path="/components/registration"
          element={<ComponentsRegistration />}
        />
        <Route
          path="/components/registration/:id"
          element={<ComponentsRegistration />}
        />
        <Route path="/audits/" element={<AssetAudits />} />
        <Route path="/audits/overdue" element={<OverdueAudits />} />
        <Route path="/audits/scheduled" element={<ScheduledAudits />} />
        <Route path="/audits/completed" element={<CompletedAudits />} />
        <Route path="/audits/new" element={<PerformAudits />} />
        <Route path="/audits/schedule" element={<ScheduleRegistration />} />
        <Route path="/audits/edit" element={<EditAudits />} />
        <Route path="/audits/view" element={<ViewAudits />} />
        <Route path="/dashboard/Repair/Maintenance" element={<Maintenance />} />
        <Route
          path="/dashboard/Repair/MaintenanceRegistration"
          element={<MaintenanceRegistration />}
        />
        <Route
          path="/dashboard/Repair/EditMaintenance"
          element={<EditMaintenance />}
        />
        <Route path="/consumables" element={<Consumables />} />
        <Route path="/upcoming-end-of-life" element={<UpcomingEndOfLife />} />
        <Route path="/warranties" element={<ExpiringWarranties />} />
        <Route path="/reached-end-of-life" element={<ReachedEndOfLife />} />
        <Route path="/expired-warranties" element={<ExpiredWarranties />} />
        <Route path="/reports/asset" element={<AssetReport />} />
        <Route path="/reports/depreciation" element={<DepreciationReport />} />
        <Route path="/reports/due-back" element={<DueBackReport />} />
        <Route
          path="/reports/eol-warranty"
          element={<EndOfLifeWarrantyReport />}
        />
        <Route path="/reports/activity" element={<ActivityReport />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="*" element={<NotFound />}></Route>
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
