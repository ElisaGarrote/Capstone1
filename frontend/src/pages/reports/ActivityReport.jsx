import { useEffect, useRef, useState } from "react";
import NavBar from "../../components/NavBar";
import Status from "../../components/Status";
import MediumButtons from "../../components/buttons/MediumButtons";
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
  const [exportToggle, setExportToggle] = useState(false);
  const exportRef = useRef(null);
  const toggleRef = useRef(null);

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // default page size or number of items per page

  // paginate the data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedActivity = MockupData.slice(startIndex, endIndex);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        exportToggle &&
        exportRef.current &&
        !exportRef.current.contains(event.target) &&
        toggleRef.current &&
        !toggleRef.current.contains(event.target)
      ) {
        setExportToggle(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [exportToggle]);

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
            <h2 className="h2">Activity Log ({MockupData.length})</h2>
            <section className="table-actions">
              <input type="search" placeholder="Search..." className="search" />
              <div ref={toggleRef}>
                <MediumButtons
                  type="export"
                  onClick={() => setExportToggle(!exportToggle)}
                />
              </div>
            </section>
          </section>

          {/* Table Structure */}
          <section className="activity-report-table-section">
            {exportToggle && (
              <section className="export-button-section" ref={exportRef}>
                <button>Download as Excel</button>
                <button>Download as PDF</button>
                <button>Download as CSV</button>
              </section>
            )}
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
              totalItems={MockupData.length}
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
