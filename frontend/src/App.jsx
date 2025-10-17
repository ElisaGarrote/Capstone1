import React from "react";
import Home from "./pages/Home";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./styles/GlobalTableStyles.css";
import ChatBot from "./components/ChatBot";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Assets/Products";
import ProductsRegistration from "./pages/Assets/ProductsRegistration";
import Assets from "./pages/Assets/Assets";
import AssetsRegistration from "./pages/Assets/AssetsRegistration";
import CheckInAsset from "./pages/Assets/CheckInAsset";
import CheckOutAsset from "./pages/Assets/CheckOutAsset";
import ApprovedTickets from "./pages/Assets/ApprovedTickets";
import Accessories from "./pages/Accessories/Accessories";
import AccessoriesRegistration from "./pages/Accessories/AccessoriesRegistration";
import CheckinAccessory from "./pages/Accessories/CheckinAccessory";
import CheckoutAccessory from "./pages/Accessories/CheckoutAccessory";
import AccessoriesCheckoutList from "./pages/Accessories/AccessoriesCheckoutList";
import Components from "./pages/Components/Components";
import ComponentRegistration from "./pages/Components/ComponentRegistration";
import ComponentCheckout from "./pages/Components/ComponentCheckout";
import ComponentCheckedoutList from "./pages/Components/ComponentCheckedoutList";
import ComponentCheckin from "./pages/Components/ComponentCheckin";
import ComponentView from "./pages/Components/ComponentView";
import AssetAudits from "./pages/asset-audit/AssetAudits";
import OverdueAudits from "./pages/asset-audit/OverdueAudits";
import ScheduledAudits from "./pages/asset-audit/ScheduledAudits";
import CompletedAudits from "./pages/asset-audit/CompletedAudits";
import PerformAudits from "./pages/asset-audit/PerformAudits";
import ScheduleRegistration from "./pages/asset-audit/ScheduleRegistration";
import ViewAudits from "./pages/asset-audit/ViewAudits";
import Repairs from "./pages/Repair/Repairs";
import RepairRegistration from "./pages/Repair/RepairRegistration";
import Consumables from "./pages/Consumables/Consumables";
import ConsumablesRegistration from "./pages/Consumables/ConsumablesRegistration";
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
import ManageProfile from "./pages/ManageProfile";
import UserManagement from "./pages/UserManagement";
import ViewCategories from "./pages/More/ViewCategories";
import CategoryRegistration from "./pages/More/CategoryRegistration";
import CategoryEdit from "./pages/More/CategoryEdit";
import ViewManufacturer from "./pages/More/ViewManufacturer";
import ManufacturerRegistration from "./pages/More/ManufacturerRegistration";
import ManufacturerEdit from "./pages/More/ManufacturerEdit";
import ViewSupplier from "./pages/More/ViewSupplier";
import SupplierTableDetails from "./pages/More/SupplierTableDetails";
import SupplierRegistration from "./pages/More/SupplierRegistration";
import SupplierEdit from "./pages/More/SupplierEdit";
import ViewStatus from "./pages/More/ViewStatus";
import StatusRegistration from "./pages/More/StatusRegistration";
import StatusEdit from "./pages/More/StatusEdit";
import StatusDetails from "./pages/More/StatusDetails";
import Depreciations from "./pages/More/Depreciations";
import DepreciationRegistration from "./pages/More/DepreciationRegistration";
import RecycleBin from "./pages/More/RecycleBin";

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <ChatBot />
      <Routes>
        {/* This will Serve as Default Path*/}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Place here all the routes accessible only for admin */}
        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route
            path="/products/registration"
            element={<ProductsRegistration />}
          />
          <Route
            path="/products/registration/:id"
            element={<ProductsRegistration />}
          />
          <Route path="/assets/registration" element={<AssetsRegistration />} />
          <Route
            path="/assets/registration/:id"
            element={<AssetsRegistration />}
          />
          <Route
            path="/components"
            element={<Components />}
          />
          <Route
            path="/components/registration"
            element={<ComponentRegistration />}
          />
          <Route
            path="/components/edit/:id"
            element={<ComponentRegistration />}
          />
          <Route
            path="/components/check-out/:id"
            element={<ComponentCheckout />}
          />
          <Route
            path="/components/checked-out-list/:id"
            element={<ComponentCheckedoutList />}
          />
          <Route
            path="/components/check-in/:id"
            element={<ComponentCheckin />}
          />
          <Route
            path="/components/view/:id"
            element={<ComponentView />}
          />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/More/ViewCategories" element={<ViewCategories />} />
          <Route
            path="/More/CategoryRegistration"
            element={<CategoryRegistration />}
          />
          <Route path="/More/CategoryEdit" element={<CategoryEdit />} />
          <Route path="/More/ViewManufacturer" element={<ViewManufacturer />} />
          <Route
            path="/More/ManufacturerRegistration"
            element={<ManufacturerRegistration />}
          />
          <Route
            path="/More/ManufacturerRegistration/:id"
            element={<ManufacturerRegistration />}
          />
          <Route
            path="/More/ManufacturerEdit/:id"
            element={<ManufacturerEdit />}
          />
          <Route path="/More/ViewSupplier" element={<ViewSupplier />} />
          <Route path="/More/SupplierEdit" element={<SupplierEdit />} />
          <Route
            path="/More/SupplierRegistration"
            element={<SupplierRegistration />}
          />
          <Route
            path="/More/SupplierTableDetails"
            element={<SupplierTableDetails />}
          />
          <Route path="/More/ViewStatus" element={<ViewStatus />} />
          <Route
            path="/More/StatusRegistration"
            element={<StatusRegistration />}
          />
          <Route path="/More/StatusEdit/:id" element={<StatusEdit />} />
          <Route path="/More/StatusDetails/:id" element={<StatusDetails />} />
          <Route
            path="/more/depreciations"
            element={<Depreciations />}
          />
          <Route
            path="/more/depreciations/registration"
            element={<DepreciationRegistration />}
          />
          <Route
            path="/more/depreciations/edit/:id"
            element={<DepreciationRegistration />}
          />
          <Route
            path="/more/recycle-bin"
            element={<RecycleBin />}
          />
        </Route>

        {/* Place here all the routes that accessible only for admin and operator */}
        <Route element={<ProtectedRoute roles={["admin", "operator"]} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/assets/check-in/:id" element={<CheckInAsset />} />
          <Route path="/assets/check-out/:id" element={<CheckOutAsset />} />
          <Route path="/components" element={<Components />} />
          <Route
            path="/components/registration"
            element={<ComponentRegistration />}
          />
          <Route
            path="/components/edit/:id"
            element={<ComponentRegistration />}
          />
          <Route
            path="/components/check-out/:id"
            element={<ComponentCheckout />}
          />
          <Route
            path="/components/checked-out-list/:id"
            element={<ComponentCheckedoutList />}
          />
          <Route
            path="/components/check-in/:id"
            element={<ComponentCheckin />}
          />
          <Route
            path="/components/view/:id"
            element={<ComponentView />}
          />
          <Route
            path="/repairs/"
            element={<Repairs />}
          />
          <Route
            path="/repairs/registration"
            element={<RepairRegistration />}
          />
          <Route
            path="/repairs/edit/:id"
            element={<RepairRegistration />}
          />
          <Route path="/audits/" element={<AssetAudits />} />
          <Route path="/audits/overdue" element={<OverdueAudits />} />
          <Route path="/audits/scheduled" element={<ScheduledAudits />} />
          <Route path="/audits/completed" element={<CompletedAudits />} />
          <Route path="/audits/schedule" element={<ScheduleRegistration />} />
          <Route path="/audits/edit/:id" element={<ScheduleRegistration />} />
          <Route path="/audits/overdue/edit/:id" element={<ScheduleRegistration />} />
          <Route path="/audits/scheduled/edit/:id" element={<ScheduleRegistration />} />
          <Route path="/audits/new" element={<PerformAudits />} />
          <Route path="/audits/view" element={<ViewAudits />} />
          <Route path="/approved-tickets" element={<ApprovedTickets />} />
          <Route path="/upcoming-end-of-life" element={<UpcomingEndOfLife />} />
          <Route path="/warranties" element={<ExpiringWarranties />} />
          <Route path="/reached-end-of-life" element={<ReachedEndOfLife />} />
          <Route path="/expired-warranties" element={<ExpiredWarranties />} />
          <Route path="/reports/asset" element={<AssetReport />} />
          <Route
            path="/reports/depreciation"
            element={<DepreciationReport />}
          />
          <Route path="/reports/due-back" element={<DueBackReport />} />
          <Route
            path="/reports/eol-warranty"
            element={<EndOfLifeWarrantyReport />}
          />
          <Route path="/reports/activity" element={<ActivityReport />} />
          <Route path="/manage-profile" element={<ManageProfile />} />

          <Route path="*" element={<NotFound />}></Route>

          {/*
          <Route path="/accessories" element={<Accessories />} />
          <Route
            path="/accessories/registration"
            element={<AccessoriesRegistration />}
          />
          <Route path="/accessories/checkin" element={<CheckinAccessory />} />
          <Route path="/accessories/checkout" element={<CheckoutAccessory />} />
          <Route
            path="/accessories/:id"
            element={<AccessoriesRegistration />}
          />
          <Route
            path="/accessories/checkout-list"
            element={<AccessoriesCheckoutList />}
          />
          <Route path="/consumables" element={<Consumables />} />
          <Route
            path="/consumables/registration"
            element={<ConsumablesRegistration />}
          />
          <Route
            path="/consumables/registration/:id"
            element={<ConsumablesRegistration />}
          />
          <Route
            path="/consumables/edit/:id"
            element={<ConsumablesRegistration />}
          />
          */}
        </Route>

        {/* Place here all the routes that do not required authetication to access */}
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/request/password_reset"
          element={<PasswordResetRequest />}
        />
        <Route path="/password-reset/:token" element={<PasswordReset />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
