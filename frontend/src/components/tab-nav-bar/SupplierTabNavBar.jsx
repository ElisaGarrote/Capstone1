import { useLocation, useNavigate } from "react-router-dom";
import MockupData from "../../data/mockData/assets/assets-mockup-data.json";

import "../../styles/component/tab-nav-bar/SupplierTabNavBar.css";

export default function SupplierTabNavBar({ supplier }) {
  const navigate = useNavigate();
  const location = useLocation();

  console.log("supplier:", supplier);

  return (
    <nav className="tab-nav">
      <ul>
        {/* Supplier Details */}
        <li
          className={
            location.pathname === `/More/SupplierDetails/${supplier.id}`
              ? "active"
              : ""
          }
          onClick={() =>
            navigate(`/More/SupplierDetails/${supplier.id}`, {
              state: { supplier },
            })
          }
        >
          <a
            className={
              location.pathname === `/More/SupplierDetails/${supplier.id}`
                ? "active"
                : ""
            }
            onClick={() =>
              navigate(`/More/SupplierDetails/${supplier.id}`, {
                state: { supplier },
              })
            }
          >
            About
          </a>
        </li>

        {/* Supplier Assets */}
        <li
          className={
            location.pathname === `/More/SupplierDetails/${supplier.id}/assets`
              ? "active"
              : ""
          }
          onClick={() =>
            navigate(`/More/SupplierDetails/${supplier.id}/assets`, {
              state: { supplier },
            })
          }
        >
          <a
            className={
              location.pathname ===
              `/More/SupplierDetails/${supplier.id}/assets`
                ? "active"
                : ""
            }
          >
            Assets ({MockupData.length})
          </a>
        </li>

        {/* Supplier Components */}
        <li
          className={
            location.pathname ===
            `/More/SupplierDetails/${supplier.id}/components`
              ? "active"
              : ""
          }
          onClick={() =>
            navigate(`/More/SupplierDetails/${supplier.id}/components`, {
              state: { supplier },
            })
          }
        >
          <a
            className={
              location.pathname ===
              `/More/SupplierDetails/${supplier.id}/components`
                ? "active"
                : ""
            }
          >
            Components (390)
          </a>
        </li>
      </ul>
    </nav>
  );
}
