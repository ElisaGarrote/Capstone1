import "../styles/TabNavBar.css";
import { useNavigate } from "react-router-dom";
import assetsService from "../services/assets-service";
import { useEffect, useState } from "react";

export default function TabNavBar() {
  const navigate = useNavigate();
  const [scheduleAuditData, setScheduleAuditData] = useState([]);
  const [auditData, setAuditData] = useState([]);

  // Retrieve all the schedule audits and audits records.
  useEffect(() => {
    const makeRequest = async () => {
      const auditSchedulesResponse =
        await assetsService.fetchAllAuditSchedules();
      const auditsResponse = await assetsService.fetchAllAudits();

      setScheduleAuditData(auditSchedulesResponse);
      setAuditData(auditsResponse);
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
            Scheduled Audits ({scheduleAuditData.length})
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
            Completed Audits ({auditData.length})
          </a>
        </li>
      </ul>
    </nav>
  );
}
