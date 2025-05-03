import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/custom-colors.css";
import "../styles/NavBar.css";
import Logo from "../assets/img/Logo.png";
import SampleProfile from "../assets/img/do.png";
import NotifIcon from "../assets/icons/notification.svg";
import { IoIosArrowDown } from "react-icons/io";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAssetsMenu, setShowAssetsMenu] = useState(false);
  const [showReportsMenu, setShowReportsMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

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
          !event.target.closest('.profile-container')) {
        setShowAssetsMenu(false);
        setShowReportsMenu(false);
        setShowMoreMenu(false);
        setShowProfileMenu(false);
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

      // Set active menu when opening dropdown, clear when closing
      if (newState) {
        setActiveMenu('assets');
      } else if (activeMenu === 'assets') {
        // Only clear if this was the active menu
        setActiveMenu(isInAssetsSection() ? 'assets' : '');
      }
    } else if (dropdown === 'reports') {
      const newState = !showReportsMenu;
      setShowReportsMenu(newState);
      setShowAssetsMenu(false);
      setShowMoreMenu(false);

      // Set active menu when opening dropdown, clear when closing
      if (newState) {
        setActiveMenu('reports');
      } else if (activeMenu === 'reports') {
        // Only clear if this was the active menu
        setActiveMenu(location.pathname.startsWith("/reports") ? 'reports' : '');
      }
    } else if (dropdown === 'more') {
      const newState = !showMoreMenu;
      setShowMoreMenu(newState);
      setShowAssetsMenu(false);
      setShowReportsMenu(false);

      // Set active menu when opening dropdown, clear when closing
      if (newState) {
        setActiveMenu('more');
      } else if (activeMenu === 'more') {
        // Only clear if this was the active menu
        setActiveMenu('');
      }
    }
  };

  // Function to check if we're in the Assets section
  const isInAssetsSection = () => {
    return location.pathname.startsWith("/products") ||
           location.pathname.startsWith("/assets") ||
           location.pathname.startsWith("/accessories") ||
           location.pathname.startsWith("/consumables") ||
           location.pathname.startsWith("/components");
  };

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
          <li className={`dropdown-container ${showAssetsMenu ? 'open' : ''}`}>
            <div
              className={`dropdown-trigger ${activeMenu === "assets" ? "active" : ""}`}
              onClick={() => toggleDropdown('assets')}
            >
              {selectedAsset} <IoIosArrowDown />
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
          <li className={`dropdown-container ${showReportsMenu ? 'open' : ''}`}>
            <div
              className={`dropdown-trigger ${activeMenu === "reports" ? "active" : ""}`}
              onClick={() => toggleDropdown('reports')}
            >
              {selectedReport} <IoIosArrowDown />
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
          <li className={`dropdown-container ${showMoreMenu ? 'open' : ''}`}>
            <div
              className={`dropdown-trigger ${activeMenu === "more" ? "active" : ""}`}
              onClick={() => toggleDropdown('more')}
            >
              {selectedMore} <IoIosArrowDown />
            </div>
            {showMoreMenu && (
              <div className="custom-dropdown more-dropdown">
                <div className="dropdown-menu">
                  <button onClick={() => {
                    navigate("/categories");
                    setSelectedMore("Categories");
                    setShowMoreMenu(false);
                  }}>Categories</button>
                  <button onClick={() => {
                    navigate("/manufacturers");
                    setSelectedMore("Manufacturers");
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
