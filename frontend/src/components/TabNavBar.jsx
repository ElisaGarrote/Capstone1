import "../styles/TabNavBar.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchDueAudits, fetchOverdueAudits, fetchScheduledAudits, fetchAllAudits } from "../services/assets-service";

export default function TabNavBar({ refreshKey = 0 }) {
  const navigate = useNavigate();
  const [countDueAudits, setCountDueAudits] = useState(0);
  const [countScheduledAudits, setCountScheduledAudits] = useState(0);
  const [countAudits, setCountAudits] = useState(0);
  const [countOverdueAudits, setCountOverdueAudits] = useState(0);

  // Retrieve the count of all the schedule audits, audits, and overdue audits.
  // Re-fetch when refreshKey changes
  useEffect(() => {
    const makeRequest = async () => {
      try {
        const [due, overdue, scheduled, completed] = await Promise.all([
          fetchDueAudits(),
          fetchOverdueAudits(),
          fetchScheduledAudits(),
          fetchAllAudits()
        ]);

        setCountDueAudits(due?.length || 0);
        setCountOverdueAudits(overdue?.length || 0);
        setCountScheduledAudits(scheduled?.length || 0);
        setCountAudits(completed?.length || 0);
      } catch (err) {
        console.error("Error fetching audit counts:", err);
      }
    };

    makeRequest();
  }, [refreshKey]);

  return (
    <nav className="tab-nav">
      <ul>
        <li className={location.pathname === "/audits" ? "active" : ""}>
          <a
            className={location.pathname === "/audits" ? "active" : ""}
            onClick={() => navigate("/audits")}
          >
            Due to be Audited ({countDueAudits})
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
            Scheduled Audit ({countScheduledAudits})
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
