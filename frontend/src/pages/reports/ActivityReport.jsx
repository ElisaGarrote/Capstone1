import { useState, useEffect, useCallback } from "react";
import NavBar from "../../components/NavBar";
import Status from "../../components/Status";
import MediumButtons from "../../components/buttons/MediumButtons";
import FilterPanel from "../../components/FilterPanel";
import Pagination from "../../components/Pagination";
import Footer from "../../components/Footer";
import { HiOutlineTag } from "react-icons/hi";
import { RxPerson, RxComponent1 } from "react-icons/rx";
import { AiOutlineAudit } from "react-icons/ai";
import { GiAutoRepair } from "react-icons/gi";
import {
  fetchActivityReport,
  downloadActivityReportExcel,
} from "../../services/assets-service";

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
    type: "dateRange",
    name: "date",
    label: "Date Range",
    fromLabel: "Start Date",
    toLabel: "End Date",
  },
  {
    type: "select",
    name: "activity_type",
    label: "Type",
    options: [
      { value: "Asset", label: "Asset" },
      { value: "Component", label: "Component" },
      { value: "Audit", label: "Audit" },
      { value: "Repair", label: "Repair" },
    ],
  },
  {
    type: "select",
    name: "action",
    label: "Event",
    options: [
      { value: "Create", label: "Create" },
      { value: "Update", label: "Update" },
      { value: "Delete", label: "Delete" },
      { value: "Checkout", label: "Checkout" },
      { value: "Checkin", label: "Checkin" },
      { value: "Schedule", label: "Schedule" },
      { value: "Passed", label: "Passed" },
      { value: "Failed", label: "Failed" },
    ],
  },
];

const getTypeIcon = (type) => {
  switch (type) {
    case "Asset":
      return <HiOutlineTag className="type-icon" />;
    case "Component":
      return <RxComponent1 className="type-icon" />;
    case "Audit":
      return <AiOutlineAudit className="type-icon" />;
    case "Repair":
      return <GiAutoRepair className="type-icon" />;
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
        <Status type={activity.action.toLowerCase()} name={activity.action} />
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
  // Data state
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Build API filters from panel filters and search
  const buildApiFilters = useCallback(() => {
    const apiFilters = {};

    // Date range filters
    if (filters.date_from) apiFilters.start_date = filters.date_from;
    if (filters.date_to) apiFilters.end_date = filters.date_to;

    // Type and action filters
    if (filters.activity_type) apiFilters.activity_type = filters.activity_type;
    if (filters.action) apiFilters.action = filters.action;

    // Search term
    if (searchTerm.trim()) apiFilters.search = searchTerm.trim();

    return apiFilters;
  }, [filters, searchTerm]);

  // Fetch activity data from backend
  const loadActivityData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const apiFilters = buildApiFilters();
      apiFilters.export_format = "json";

      const response = await fetchActivityReport(apiFilters);
      setActivityData(response.results || []);
    } catch (err) {
      console.error("Error fetching activity report:", err);
      setError("Failed to load activity data. Please try again.");
      setActivityData([]);
    } finally {
      setLoading(false);
    }
  }, [buildApiFilters]);

  // Load data on mount and when filters change
  useEffect(() => {
    loadActivityData();
  }, [loadActivityData]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchTerm]);

  // Handle filter changes from FilterPanel
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search on Enter key
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      loadActivityData();
    }
  };

  // Paginate the data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedActivity = activityData.slice(startIndex, endIndex);

  // Handle export to Excel
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const apiFilters = buildApiFilters();
      const name = "ActivityReport";
      const dateGenerated = getFormattedDate();
      const token = generateToken();
      const fileName = `${name}_${dateGenerated}_${token}.xlsx`;

      await downloadActivityReportExcel(apiFilters, fileName);
    } catch (err) {
      console.error("Error exporting activity report:", err);
      setError("Failed to export report. Please try again.");
    } finally {
      setExporting(false);
    }
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
        <FilterPanel filters={filterConfig} onFilter={handleFilterChange} />

        {/* Error message */}
        {error && (
          <div
            className="error-message"
            style={{ color: "red", padding: "10px" }}
          >
            {error}
          </div>
        )}

        <section className="table-layout">
          {/* Table Header */}
          <section className="table-header">
            <h2 className="h2">
              Activity Log{" "}
              {loading ? "(Loading...)" : `(${activityData.length})`}
            </h2>
            <section className="table-actions">
              <input
                type="search"
                placeholder="Search..."
                className="search"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
              />
              <MediumButtons
                type="export"
                onClick={handleExportExcel}
                disabled={exporting || loading}
              />
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
                      Loading activity logs...
                    </td>
                  </tr>
                ) : paginatedActivity.length > 0 ? (
                  paginatedActivity.map((activity, index) => (
                    <TableItem key={activity.id || index} activity={activity} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="no-data-message">
                      No activity log found.
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
              totalItems={activityData.length}
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
