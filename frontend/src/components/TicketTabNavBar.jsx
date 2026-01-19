import "../styles/TabNavBar.css";
import { useNavigate, useLocation } from "react-router-dom";

export default function TicketTabNavBar({ ticketCounts = {} }) {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { path: "/tickets", label: "All", key: "all" },
    { path: "/tickets/registration", label: "Registration", key: "registration" },
    { path: "/tickets/check-out", label: "Check-out", key: "check-out" },
    { path: "/tickets/check-in", label: "Check-in", key: "check-in" },
    { path: "/tickets/repair", label: "Repair", key: "repair" },
    { path: "/tickets/incident", label: "Incident", key: "incident" },
    { path: "/tickets/disposal", label: "Disposal", key: "disposal" },
  ];

  return (
    <nav className="tab-nav">
      <ul>
        {tabs.map((tab) => (
          <li key={tab.key} className={location.pathname === tab.path ? "active" : ""}>
            <a
              className={location.pathname === tab.path ? "active" : ""}
              onClick={() => navigate(tab.path)}
            >
              {tab.label} (0)
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
