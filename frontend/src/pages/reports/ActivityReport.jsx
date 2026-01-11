import { useEffect, useRef, useState } from "react";
import NavBar from "../../components/NavBar";
import Status from "../../components/Status";
import MediumButtons from "../../components/buttons/MediumButtons";
import { exportToExcel } from "../../utils/exportToExcel";
import MockupData from "../../data/mockData/reports/activity-report-mockup-data.json";
import ActivityFilterModal from "../../components/Modals/ActivityFilterModal";
import Pagination from "../../components/Pagination";
import Footer from "../../components/Footer";
import { BsKeyboard } from "react-icons/bs";
import { LuDroplet } from "react-icons/lu";
import { HiOutlineTag } from "react-icons/hi";
import { RxPerson } from "react-icons/rx";
import { AiOutlineAudit } from "react-icons/ai";
import { RxComponent1 } from "react-icons/rx";

import "../../styles/reports/ActivityReport.css";

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
  const handleToggleFilter = () => setIsFilterModalOpen(true);

  // filter modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [filteredData, setFilteredData] = useState(MockupData);
  const [searchTerm, setSearchTerm] = useState("");

  const applyFilters = (filters) => {
    let filtered = [...MockupData];

    if (filters?.type) {
      filtered = filtered.filter(
        (row) => String(row.type || "").toLowerCase() === String(filters.type || "").toLowerCase()
      );
    }

    if (filters?.event) {
      filtered = filtered.filter(
        (row) => String(row.action || "").toLowerCase() === String(filters.event || "").toLowerCase()
      );
    }

    if (filters?.user && String(filters.user).trim() !== "") {
      filtered = filtered.filter((row) =>
        String(row.user || "").toLowerCase().includes(String(filters.user).toLowerCase())
      );
    }

    if (filters?.tofrom && String(filters.tofrom).trim() !== "") {
      filtered = filtered.filter((row) =>
        String(row.to_from || "").toLowerCase().includes(String(filters.tofrom).toLowerCase())
      );
    }

    return filtered;
  };

  const applyFiltersAndSearch = (filters, searchTerm) => {
    let filtered = applyFilters(filters);

    if (searchTerm && searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((item) =>
        (item.user && item.user.toLowerCase().includes(term)) ||
        (item.type && item.type.toLowerCase().includes(term)) ||
        (item.action && item.action.toLowerCase().includes(term)) ||
        (item.item && item.item.toLowerCase().includes(term)) ||
        (item.to_from && item.to_from.toLowerCase().includes(term)) ||
        (item.notes && item.notes.toLowerCase().includes(term))
      );
    }

    return filtered;
  };

  const handleApplyFilter = (filters) => {
    setAppliedFilters(filters);
    const filtered = applyFiltersAndSearch(filters, searchTerm);
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleResetFilter = () => {
    setAppliedFilters({});
    const filtered = applyFiltersAndSearch({}, searchTerm);
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedActivity = filteredData.slice(startIndex, endIndex);

  useEffect(() => {
  }, []);

  const handleExport = () => {
    const dataToExport = filteredData.length > 0 ? filteredData : MockupData;
    exportToExcel(dataToExport, "Activity_Report.xlsx");
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setCurrentPage(1);
    const filtered = applyFiltersAndSearch(appliedFilters, term);
    setFilteredData(filtered);
  };

  return (
    <section className="page-layout-with-table">
      <NavBar />

      <main className="main-with-table">
        {/* Title of the Page */}
        <section className="title-page-section">
          <h1>Activity Report</h1>
        </section>

        <section className="table-layout">
          {/* Table Header */}
          <section className="table-header">
            <h2 className="h2">Activity Log ({filteredData.length})</h2>
            <section className="table-actions">
              <input
                type="search"
                placeholder="Search..."
                className="search"
                value={searchTerm}
                onChange={handleSearch}
              />
              <button
                type="button"
                className="medium-button-filter"
                onClick={handleToggleFilter}
              >
                Filter
              </button>
              <ActivityFilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                onApplyFilter={handleApplyFilter}
                onResetFilter={handleResetFilter}
                initialFilters={appliedFilters}
              />
              <div>
                <MediumButtons type="export" onClick={handleExport} />
              </div>
            </section>
          </section>

          {/* Table Structure */}
          <section className="activity-report-table-section">
            <table>
              <thead>
                <TableHeader />
              </thead>
              <tbody>
                {paginatedActivity.length > 0 ? (
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
              totalItems={filteredData.length}
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
