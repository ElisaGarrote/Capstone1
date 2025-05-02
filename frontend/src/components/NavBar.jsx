import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import "../styles/custom-colors.css";
import "../styles/NavBar.css";
import Logo from "../assets/img/Logo.png";
import SampleProfile from "../assets/img/do.png";
import NotifIcon from "../assets/icons/notification.svg";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Function to handle the navigation route from the dropdown
  const handleNavigation = (event) => {
    const value = event.target.value;
    if (value === "Products") {
      navigate("/products");
    }
    if (value === "Assets") {
      navigate("/assets");
    }
    if (value === "Accessories") {
      navigate("/accessories");
    }
    if (value === "Consumable") {
      navigate("/Consumables/ViewConsumables");
    }
    if (value === "Components") {
      navigate("/components");
    }
  };

  // Function to handle reports navigation
  const handleReportsNavigation = (event) => {
    const value = event.target.value;
    console.log("Selected value:", value);

    if (value === "Asset Reports") {
      navigate("/reports/asset");
    } else if (value === "Depreciation Reports") {
      navigate("/reports/depreciation");
    } else if (value === "Due Back Reports") {
      navigate("/reports/due-back");
    } else if (value === "End of Life and Warranty Reports") {
      navigate("/reports/eol-warranty");
    } else if (value === "Activity Reports") {
      console.log("Navigating to activity reports");
      navigate("/reports/activity");
    }
  };

  // Function to handle the current selected dropdown menu based on the current location path of the page
  const currentDropdownPage = () => {
    if (location.pathname.startsWith("/products")) {
      return "Products";
    }
    if (location.pathname.startsWith("/assets")) {
      return "Assets";
    }
    if (location.pathname.startsWith("/accessories")) {
      return "Accessories";
    }
    if (location.pathname.startsWith("/Consumables")) {
      return "Consumable";
    }
    if (location.pathname.startsWith("/components")) {
      return "Components";
    }
    // Add other condition here
  };

  // Function to handle more dropdown navigation
  const handleMoreNavigation = (event) => {
    const value = event.target.value;
    // Navigate based on selection but reset dropdown to default
    if (value === "Categories") {
      navigate("/categories");
    } else if (value === "Manufacturers") {
      navigate("/manufacturers");
    } else if (value === "Suppliers") {
      navigate("/suppliers");
    } else if (value === "Statuses") {
      navigate("/statuses");
    } else if (value === "Depreciations") {
      navigate("/depreciations");
    } else if (value === "Recycle Bin") {
      navigate("/recycle-bin");
    }

    // Reset the dropdown to default "More" after navigation
    event.target.value = "";
  };

  // Function to get current reports page
  const getCurrentReportsPage = () => {
    const pathToValue = {
      '/reports/asset': 'Asset Reports',
      '/reports/depreciation': 'Depreciation Reports',
      '/reports/due-back': 'Due Back Reports',
      '/reports/eol-warranty': 'End of Life and Warranty Reports',
      '/reports/activity': 'Activity Reports'
    };
    return pathToValue[location.pathname] || '';
  };

  return (
    <nav className="main-nav-bar">
      <section>
        <img src={Logo} alt="Logo" />
      </section>
      <section>
        <ul>
          <li>
            <a
              onClick={() => navigate("/dashboard")}
              className={location.pathname === "/dashboard" ? "active" : ""}
            >
              Dashboard
            </a>
          </li>
          <li>
            <select
              name="assets-more"
              id="assets-more"
              defaultValue=""
              value={currentDropdownPage()}
              onChange={handleNavigation}
              className={currentDropdownPage() != null ? "active" : ""}
            >
              <option value="" disabled hidden>
                Assets
              </option>
              <option value="Products">Products</option>
              <option value="Assets">Assets</option>
              <option value="Accessories">Accessories</option>
              <option value="Consumable">Consumable</option>
              <option value="Components">Components</option>
            </select>
          </li>
          <li>
            <a
              onClick={() => navigate("/dashboard/Repair/Maintenance")}
              className={location.pathname.startsWith("/dashboard/Repair") ? "active" : ""}
            >
              Repairs
            </a>
          </li>
          <li>
            <a
              className={location.pathname.startsWith("/audits") ? "active" : ""}
              onClick={() => navigate("/audits")}
            >
              Audits
            </a>
          </li>
          <li>
            <select
              name="reports-more"
              id="reports-more"
              value={getCurrentReportsPage()}
              onChange={handleReportsNavigation}
              className={location.pathname.startsWith("/reports") ? "active" : ""}
            >
              <option value="" disabled hidden>
                Reports
              </option>
              <option value="Asset Reports">Asset Reports</option>
              <option value="Depreciation Reports">Depreciation Reports</option>
              <option value="Due Back Reports">Due Back Reports</option>
              <option value="End of Life and Warranty Reports">
                EoL & Warranty Reports
              </option>
              <option value="Activity Reports">Activity Reports</option>
            </select>
          </li>
          <li>
            <select
              name="more-options"
              id="more-options"
              defaultValue=""
              onChange={handleMoreNavigation}
            >
              <option value="" disabled hidden>
                More
              </option>
              <option value="Categories">Categories</option>
              <option value="Manufacturers">Manufacturers</option>
              <option value="Suppliers">Suppliers</option>
              <option value="Statuses">Statuses</option>
              <option value="Depreciations">Depreciations</option>
              <option value="Recycle Bin">Recycle Bin</option>
            </select>
          </li>
        </ul>
      </section>
      <section>
        <img src={NotifIcon} alt="notif-icon" className="notif-icon" />
        <div className="profile-container">
          <img
            src={SampleProfile}
            alt="sample-profile"
            className="sample-profile"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          />
          {showProfileMenu && (
            <div className="profile-dropdown">
              <div className="profile-header">
                <img src={SampleProfile} alt="profile" />
                <div className="profile-info">
                  <h3>Mary Grace Piattos</h3>
                  <span className="admin-badge">Admin</span>
                </div>
              </div>
              <div className="profile-menu">
                <button onClick={() => navigate("/settings")}>Settings</button>
                <button onClick={() => navigate("/user-management")}>User Management</button>
                <button onClick={() => navigate("/logout")} className="logout-btn">Log Out</button>
              </div>
            </div>
          )}
        </div>
      </section>
    </nav>
  );
}
