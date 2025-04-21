import "../styles/TabNavBar.css";
import { useNavigate } from "react-router-dom";

export default function TabNavBar() {
  const navigate = useNavigate();

  return (
    <nav className="tab-nav">
      <ul>
        <li className={location.pathname === "/audits" ? "active" : ""}>
          <a
            className={location.pathname === "/audits" ? "active" : ""}
            onClick={() => navigate("/audits")}
          >
            Due to be Audited (3)
          </a>
        </li>
        <li className={location.pathname === "/audits/overdue" ? "active" : ""}>
          <a
            className={location.pathname === "/audits/overdue" ? "active" : ""}
            onClick={() => navigate("/audits/overdue")}
          >
            Overdue for an Audits (3)
          </a>
        </li>
        <li
          className={location.pathname === "/audits/scheduled" ? "active" : ""}
        >
          <a
            className={
              location.pathname === "/audits/scheduled" ? "active" : ""
            }
            onClick={() => navigate("/audits/scheduled")}
          >
            Scheduled Audits (3)
          </a>
        </li>
        <li
          className={location.pathname === "/audits/completed" ? "active" : ""}
        >
          <a
            className={
              location.pathname === "/audits/completed" ? "active" : ""
            }
            onClick={() => navigate("/audits/completed")}
          >
            Completed Audits (3)
          </a>
        </li>
      </ul>
    </nav>
  );
}
