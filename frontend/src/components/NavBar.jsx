import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/custom-colors.css";
import "../styles/NavBar.css";
import Logo from "../assets/img/Logo.png";
import SampleProfile from "../assets/img/do.png";
import { IoIosArrowDown } from "react-icons/io";
import NotificationOverlay from "./NotificationOverlay";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAssetsMenu, setShowAssetsMenu] = useState(false);
  const [showReportsMenu, setShowReportsMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(4);

  // State for selected items in each dropdown
  const [selectedAsset, setSelectedAsset] = useState("Assets");
  const [selectedReport, setSelectedReport] = useState("Reports");
  const [selectedMore, setSelectedMore] = useState("More");

  // State to track which menu item is active
  const [activeMenu, setActiveMenu] = useState("");

  // Close all dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container') &&
          !event.target.closest('.profile-container') &&
          !event.target.closest('.notification-container') &&
          !event.target.closest('.notification-icon-container')) {
        setShowAssetsMenu(false);
        setShowReportsMenu(false);
        setShowMoreMenu(false);
        setShowProfileMenu(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Function to toggle a dropdown and close others
  const toggleDropdown = (dropdown) => {
    if (dropdown === 'assets') {
      const newState = !showAssetsMenu;
      setShowAssetsMenu(newState);
      setShowReportsMenu(false);
      setShowMoreMenu(false);

      // Always set active menu when clicked, regardless of dropdown state
      setActiveMenu('assets');
    } else if (dropdown === 'reports') {
      const newState = !showReportsMenu;
      setShowReportsMenu(newState);
      setShowAssetsMenu(false);
      setShowMoreMenu(false);

      // Always set active menu when clicked, regardless of dropdown state
      setActiveMenu('reports');
    } else if (dropdown === 'more') {
      const newState = !showMoreMenu;
      setShowMoreMenu(newState);
      setShowAssetsMenu(false);
      setShowReportsMenu(false);

      // Always set active menu when clicked, regardless of dropdown state
      setActiveMenu('more');
    }
  };

  // Function to check if we're in the Assets section (kept for future reference)
  /* const isInAssetsSection = () => {
    return location.pathname.startsWith("/products") ||
           location.pathname.startsWith("/assets") ||
           location.pathname.startsWith("/accessories") ||
           location.pathname.startsWith("/consumables") ||
           location.pathname.startsWith("/components");
  }; */

  // Initialize selected items based on current location
  useEffect(() => {
    // Set active menu based on path
    if (location.pathname === "/dashboard") {
      setActiveMenu("dashboard");
    } else if (location.pathname.startsWith("/products") ||
               location.pathname.startsWith("/assets") ||
               location.pathname.startsWith("/accessories") ||
               location.pathname.startsWith("/consumables") ||
               location.pathname.startsWith("/components")) {
      setActiveMenu("assets");
    } else if (location.pathname.startsWith("/dashboard/Repair")) {
      setActiveMenu("repairs");
    } else if (location.pathname.startsWith("/audits")) {
      setActiveMenu("audits");
    } else if (location.pathname.startsWith("/approved-tickets")) {
      setActiveMenu("tickets");
    } else if (location.pathname.startsWith("/reports")) {
      setActiveMenu("reports");
    } else {
      setActiveMenu("");
    }

    // Set selected asset based on path
    if (location.pathname.startsWith("/products")) {
      setSelectedAsset("Products");
    } else if (location.pathname.startsWith("/assets")) {
      setSelectedAsset("Assets");
    } else if (location.pathname.startsWith("/accessories")) {
      setSelectedAsset("Accessories");
    } else if (location.pathname.startsWith("/consumables")) {
      setSelectedAsset("Consumable");
    } else if (location.pathname.startsWith("/components")) {
      setSelectedAsset("Components");
    }

    // Set selected report based on path
    if (location.pathname.startsWith("/reports/asset")) {
      setSelectedReport("Asset Reports");
    } else if (location.pathname.startsWith("/reports/depreciation")) {
      setSelectedReport("Depreciation Reports");
    } else if (location.pathname.startsWith("/reports/due-back")) {
      setSelectedReport("Due Back Reports");
    } else if (location.pathname.startsWith("/reports/eol-warranty")) {
      setSelectedReport("EoL & Warranty Reports");
    } else if (location.pathname.startsWith("/reports/activity")) {
      setSelectedReport("Activity Reports");
    }
  }, [location.pathname]);

  return (
    <nav className="main-nav-bar">
      <section>
        <img src={Logo} alt="Logo" />
      </section>
      <section>
        <ul>
          <li>
            <a
              onClick={() => {
                navigate("/dashboard");
                setActiveMenu("dashboard");
              }}
              className={activeMenu === "dashboard" ? "active" : ""}
            >
              Dashboard
            </a>
          </li>
          <li className={`dropdown-container assets-dropdown-container ${showAssetsMenu ? 'open' : ''}`}>
            <div
              className={`dropdown-trigger ${activeMenu === "assets" ? "active" : ""}`}
              onClick={() => toggleDropdown('assets')}
            >
              <span className="dropdown-text">{selectedAsset}</span> <IoIosArrowDown />
            </div>
            {showAssetsMenu && (
              <div className="custom-dropdown assets-dropdown">
                <div className="dropdown-menu">
                  <button onClick={() => {
                    navigate("/products");
                    setSelectedAsset("Products");
                    setShowAssetsMenu(false);
                  }}>Products</button>
                  <button onClick={() => {
                    navigate("/assets");
                    setSelectedAsset("Assets");
                    setShowAssetsMenu(false);
                  }}>Assets</button>
                  <button onClick={() => {
                    navigate("/accessories");
                    setSelectedAsset("Accessories");
                    setShowAssetsMenu(false);
                  }}>Accessories</button>
                  <button onClick={() => {
                    navigate("/consumables");
                    setSelectedAsset("Consumable");
                    setShowAssetsMenu(false);
                  }}>Consumable</button>
                  <button onClick={() => {
                    navigate("/components");
                    setSelectedAsset("Components");
                    setShowAssetsMenu(false);
                  }}>Components</button>
                </div>
              </div>
            )}
          </li>
          <li>
            <a
              onClick={() => {
                navigate("/dashboard/Repair/Maintenance");
                setActiveMenu("repairs");
              }}
              className={activeMenu === "repairs" ? "active" : ""}
            >
              Repairs
            </a>
          </li>
          <li>
            <a
              className={activeMenu === "audits" ? "active" : ""}
              onClick={() => {
                navigate("/audits");
                setActiveMenu("audits");
              }}
            >
              Audits
            </a>
          </li>
          <li>
            <a
              className={activeMenu === "tickets" ? "active" : ""}
              onClick={() => {
                navigate("/approved-tickets");
                setActiveMenu("tickets");
              }}
            >
              Tickets
            </a>
          </li>
          <li className={`dropdown-container reports-dropdown-container ${showReportsMenu ? 'open' : ''}`}>
            <div
              className={`dropdown-trigger ${activeMenu === "reports" ? "active" : ""}`}
              onClick={() => toggleDropdown('reports')}
            >
              <span className="dropdown-text">{selectedReport}</span> <IoIosArrowDown />
            </div>
            {showReportsMenu && (
              <div className="custom-dropdown reports-dropdown">
                <div className="dropdown-menu">
                  <button onClick={() => {
                    navigate("/reports/asset");
                    setSelectedReport("Asset Reports");
                    setShowReportsMenu(false);
                  }}>Asset Reports</button>
                  <button onClick={() => {
                    navigate("/reports/depreciation");
                    setSelectedReport("Depreciation Reports");
                    setShowReportsMenu(false);
                  }}>Depreciation Reports</button>
                  <button onClick={() => {
                    navigate("/reports/due-back");
                    setSelectedReport("Due Back Reports");
                    setShowReportsMenu(false);
                  }}>Due Back Reports</button>
                  <button onClick={() => {
                    navigate("/reports/eol-warranty");
                    setSelectedReport("EoL & Warranty Reports");
                    setShowReportsMenu(false);
                  }}>EoL & Warranty Reports</button>
                  <button onClick={() => {
                    navigate("/reports/activity");
                    setSelectedReport("Activity Reports");
                    setShowReportsMenu(false);
                  }}>Activity Reports</button>
                </div>
              </div>
            )}
          </li>
          <li className={`dropdown-container more-dropdown-container ${showMoreMenu ? 'open' : ''}`}>
            <div
              className={`dropdown-trigger ${activeMenu === "more" ? "active" : ""}`}
              onClick={() => toggleDropdown('more')}
            >
              <span className="dropdown-text">{selectedMore}</span> <IoIosArrowDown />
            </div>
            {showMoreMenu && (
              <div className="custom-dropdown more-dropdown">
                <div className="dropdown-menu">
                  <button onClick={() => {
                    navigate("/More/ViewCategories");
                    setSelectedMore("Categories");
                    setShowMoreMenu(false);
                  }}>Categories</button>
                  <button onClick={() => {
                    navigate("/More/Viewmanufacturer");
                    setSelectedMore("Manufacturer");
                    setShowMoreMenu(false);
                  }}>Manufacturers</button>
                  <button onClick={() => {
                    navigate("/suppliers");
                    setSelectedMore("Suppliers");
                    setShowMoreMenu(false);
                  }}>Suppliers</button>
                  <button onClick={() => {
                    navigate("/statuses");
                    setSelectedMore("Statuses");
                    setShowMoreMenu(false);
                  }}>Statuses</button>
                  <button onClick={() => {
                    navigate("/depreciations");
                    setSelectedMore("Depreciations");
                    setShowMoreMenu(false);
                  }}>Depreciations</button>
                  <button onClick={() => {
                    navigate("/recycle-bin");
                    setSelectedMore("Recycle Bin");
                    setShowMoreMenu(false);
                  }}>Recycle Bin</button>
                </div>
              </div>
            )}
          </li>
        </ul>
      </section>
      <section>
        <div className="notification-icon-container">
          <div
            className="notification-icon-wrapper"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="notif-icon"
            >
              <path
                fillRule="evenodd"
                d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z"
                clipRule="evenodd"
              />
            </svg>
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
          </div>
          {showNotifications && (
            <NotificationOverlay
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
            />
          )}
        </div>
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
