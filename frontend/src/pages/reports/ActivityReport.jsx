import { useState, useEffect } from "react";
import NavBar from "../../components/NavBar";
import Status from "../../components/Status";
import MediumButtons from "../../components/buttons/MediumButtons";
import axios from "axios";
import MockupData from "../../data/mockData/reports/activity-report-mockup-data.json";
import DepreciationFilter from "../../components/FilterPanel";
import Pagination from "../../components/Pagination";
import Footer from "../../components/Footer";
import { BsKeyboard } from "react-icons/bs";
import { LuDroplet } from "react-icons/lu";
import { HiOutlineTag } from "react-icons/hi";
import { RxPerson } from "react-icons/rx";
import { AiOutlineAudit } from "react-icons/ai";
import { RxComponent1 } from "react-icons/rx";
import { exportToExcel } from "../../utils/exportToExcel";

import "../../styles/reports/ActivityReport.css";

// Generate a random 7-character alphanumeric token
const generateToken = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 7; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

// Get formatted date as YYYYMMDD
const getFormattedDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

const filterConfig = [
  {
    type: "select",
    name: "type",
    label: "Type",
    options: [
      { value: "accessory", label: "Accessory" },
      { value: "asset", label: "Asset" },
      { value: "audit", label: "Audit" },
      { value: "component", label: "Component" },
      { value: "consumable", label: "Consumable" },
    ],
  },
  {
    type: "select",
    name: "event",
    label: "Event",
    options: [
      { value: "checkin", label: "Checkin" },
      { value: "checkout", label: "Checkout" },
      { value: "create", label: "Create" },
      { value: "delete", label: "Delete" },
      { value: "failed", label: "Failed" },
      { value: "passed", label: "Passed" },
      { value: "repair", label: "Repair" },
      { value: "schedule", label: "Schedule" },
      { value: "update", label: "Update" },
    ],
  },
  {
    type: "text",
    name: "user",
    label: "User",
  },
  {
    type: "text",
    name: "tofrom",
    label: "To/From",
  },
];

const toTitleCase = (str = "") =>
  str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

const getTypeIcon = (type) => {
  switch (type) {
    case "Asset":
      return <HiOutlineTag className="type-icon" />;
    case "Accessory":
      return <BsKeyboard className="type-icon" />;
    case "Consumable":
      return <LuDroplet className="type-icon" />;
    case "Audit":
      return <AiOutlineAudit className="type-icon" />;
    case "Component":
      return <RxComponent1 className="type-icon" />;
    default:
      return <HiOutlineTag className="type-icon" />;
  }
};

// TableHeader component to render the table header
function TableHeader() {
  return (
    <tr>
      <th>DATE</th>
      <th>USER</th>
      <th>TYPE</th>
      <th>EVENT</th>
      <th>ITEM</th>
      <th>TO/FROM</th>
      <th>NOTES</th>
    </tr>
  );
}

// TableItem component to render each ticket row
function TableItem({ activity }) {
  return (
    <tr>
      <td>{activity.date}</td>
      <td>
        <div className="icon-td">
          <RxPerson className="user-icon" />
          <span>{activity.user}</span>
        </div>
      </td>
      <td>
        <div className="icon-td">
          {getTypeIcon(activity.type)}
          <span>{activity.type}</span>
        </div>
      </td>
      <td>
        <Status
          type={activity.action.toLowerCase()}
          name={toTitleCase(activity.action)}
        />
      </td>
      <td>{activity.item}</td>
      <td>
        <div className="icon-td">
          {activity.to_from ? <RxPerson className="user-icon" /> : "-"}
          <span>{activity.to_from}</span>
        </div>
      </td>
      <td>{activity.notes || "-"}</td>
    </tr>
  );
}

export default function ActivityReport() {
  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // default page size or number of items per page
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // paginate the data (client-side after fetching)
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const sourceData = activities.length > 0 ? activities : MockupData;
  const paginatedActivity = sourceData.slice(startIndex, endIndex);

  // Fetch activity logs from backend
  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      setError(null);
      try {
        const base =
          import.meta.env.VITE_ACTIVITY_LOGS_API_URL || "/api/assets/";
        const resp = await axios.get(`${base}activity-logs/`);
        console.log("Activity logs response:", resp.data);
        // DRF may paginate responses; handle both shapes
        const raw =
          resp.data && resp.data.results ? resp.data.results : resp.data;
        if (Array.isArray(raw)) {
          const mapped = raw.map((r) => {
            const datetime =
              r.datetime ||
              r.date ||
              r.created_at ||
              r.timestamp ||
              r.date_created;
            const date = datetime
              ? new Date(datetime).toLocaleString()
              : r.date || "";
            const user =
              r.user_name ||
              r.user ||
              (r.user_id ? `User ${r.user_id}` : "System");
            const type = r.activity_type || r.type || "";
            const action = r.action || "";
            const item =
              r.item_name ||
              r.item_identifier ||
              r.item ||
              (r.item_id ? `#${r.item_id}` : "");
            const to_from = r.target_name || r.to_from || "";
            const notes = r.notes || r.note || "";
            return { date, user, type, action, item, to_from, notes };
          });
          setActivities(mapped);
        }
      } catch (err) {
        console.error("Failed to load activity logs", err);
        setError("Failed to load activity logs");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Handle export to Excel with format: [Name]_[DateGenerated]_[7DigitToken].xlsx
  const handleExportExcel = () => {
    const name = "ActivityReport";
    const dateGenerated = getFormattedDate();
    const token = generateToken();
    const fileName = `${name}_${dateGenerated}_${token}.xlsx`;

    // use the currently displayed source data (fetched activities or mockup fallback)
    exportToExcel(sourceData, fileName);
  };

  return (
    <section className="page-layout-with-table">
      <NavBar />

      <main className="main-with-table">
        {/* Title of the Page */}
        <section className="title-page-section">
          <h1>Activity Report</h1>
        </section>

        {/* Table Filter */}
        <DepreciationFilter filters={filterConfig} />

        <section className="table-layout">
          {/* Table Header */}
          <section className="table-header">
            <h2 className="h2">Activity Log ({sourceData.length})</h2>
            <section className="table-actions">
              <input type="search" placeholder="Search..." className="search" />
              <MediumButtons type="export" onClick={handleExportExcel} />
            </section>
          </section>

          {/* Table Structure */}
          <section className="activity-report-table-section">
            <table>
              <thead>
                <TableHeader />
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="no-data-message">
                      Loading...
                    </td>
                  </tr>
                ) : paginatedActivity.length > 0 ? (
                  paginatedActivity.map((activity, index) => (
                    <TableItem
                      key={index}
                      activity={activity}
                      onDeleteClick={() => setDeleteModalOpen(true)}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="no-data-message">
                      {error || "No activity log found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          {/* Table pagination */}
          <section className="table-pagination">
            <Pagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={sourceData.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </section>
        </section>
      </main>
      <Footer />
    </section>
  );
}
