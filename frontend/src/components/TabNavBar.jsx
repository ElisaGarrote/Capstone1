import "../styles/TabNavBar.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchDashboardStats } from "../services/assets-service";

export default function TabNavBar() {
  const navigate = useNavigate();
  const [countScheduleAudits, setCountScheduleAudits] = useState(0);
  const [countAudits, setCountAudits] = useState(0);
  const [countOverdueAudits, setCountOverdueAudits] = useState(0);

  // Retrieve the count of all the schedule audits, audits, and overdue audits.
  useEffect(() => {
    const makeRequest = async () => {
      try {
        const stats = await fetchDashboardStats();

        // Map backend dashboard keys to the UI counters. Use safe defaults.
        setCountScheduleAudits(stats.upcoming_audits ?? 0);
        setCountOverdueAudits(stats.overdue_audits ?? 0);
        setCountAudits(stats.completed_audits ?? 0);
      } catch (err) {
        // If dashboard endpoint fails, keep counts at zero and avoid crashing
        console.error("Failed to load dashboard stats for TabNavBar:", err);
      }
    };

    makeRequest();
  }, []);

  return (
    <nav className="tab-nav">
      <ul>
        <li className={location.pathname === "/audits" ? "active" : ""}>
          <a
            className={location.pathname === "/audits" ? "active" : ""}
            onClick={() => navigate("/audits")}
          >
            Due to be Audited ({countScheduleAudits})
          </a>
        </li>
        <li className={location.pathname === "/audits/overdue" ? "active" : ""}>
          <a
            className={location.pathname === "/audits/overdue" ? "active" : ""}
            onClick={() => navigate("/audits/overdue")}
          >
            Overdue for Audit ({countOverdueAudits})
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
            Scheduled Audit ({countScheduleAudits})
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
            Completed Audit ({countAudits})
          </a>
        </li>
      </ul>
    </nav>
  );
}
