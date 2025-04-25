import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import Consumables from './pages/Consumables/ViewConsumables';import ResetPasswordEmail from "./pages/ResetPasswordEmail"
import SetPassword from "./pages/SetPassword"

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
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password-email" element={<ResetPasswordEmail />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/registration" element={<ProductsRegistration />} />
        <Route path="/products/registration/:id" element={<ProductsRegistration />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/assets/registration" element={<AssetsRegistration />} />
        <Route path="/assets/registration/:id" element={<AssetsRegistration />} />
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
        <Route path="/components/check-out/:id" element={<CheckOutComponent />} />
        <Route path="/components/checked-out-list/:id" element={<CheckedOutList />} />
        <Route path="/components/check-in/:id" element={<CheckInComponent />} />
        <Route path="/components/registration" element={<ComponentsRegistration />} />
        <Route path="/audits/" element={<AssetAudits />} />
        <Route path="/audits/overdue" element={<OverdueAudits />} />
        <Route path="/audits/scheduled" element={<ScheduledAudits />} />
        <Route path="/audits/completed" element={<CompletedAudits />} />
        <Route path="/audits/new" element={<PerformAudits />} />
        <Route path="/audits/schedule" element={<ScheduleRegistration />} />
        <Route path="/audits/edit" element={<EditAudits />} />
        <Route path="/audits/view" element={<ViewAudits />} />
        <Route path="/dashboard/Repair/Maintenance" element={<Maintenance />} />
        <Route path="/dashboard/Repair/MaintenanceRegistration" element={<MaintenanceRegistration />} />
        <Route path="/dashboard/Repair/EditMaintenance" element={<EditMaintenance />} />
        <Route path="/Consumables/ViewConsumables" element={<Consumables />} />
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
