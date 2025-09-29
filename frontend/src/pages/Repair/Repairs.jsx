import { useEffect, useRef, useState } from "react";
import NavBar from "../../components/NavBar";
import Status from "../../components/Status";
import MediumButtons from "../../components/buttons/MediumButtons";
import MockupData from "../../data/mockData/repairs/asset-repair-mockup-data.json";
import RepairFilter from "../../components/FilterPanel";
import Pagination from "../../components/Pagination";
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
    name: "status",
    label: "Status",
    options: [
      { value: "beingrepaired", label: "Being Repaired" },
      { value: "broken", label: "Broken" },
      { value: "deployed", label: "Deployed" },
      { value: "lostorstolen", label: "Lost or Stolen" },
      { value: "pending", label: "Pending" },
      { value: "readytodeploy", label: "Ready to Deploy" },
    ],
  },
  {
    type: "dateRange",
    name: "assetsbeingrepaired",
    fromLabel: "Start Date",
    toLabel: "End Date",
  },
  {
    type: "searchable",
    name: "asset",
    label: "Asset",
    options: [
      { value: "1", label: "Lenovo Yoga 7" },
      { value: "2", label: "Iphone 16 Pro Max" },
      { value: "3", label: "Ideapad 3" },
      { value: "4", label: "Ipad Pro" },
      { value: "5", label: "HP Spectre x360" },
    ],
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
      <th>ASSET</th>
      <th>TYPE</th>
      <th>NAME</th>
      <th>START DATE</th>
      <th>END DATE</th>
      <th>COST</th>
      <th>STATUS</th>
      <th>ACITON</th>
    </tr>
  );
}

// TableItem component to render each ticket row
function TableItem({ repair }) {
  return (
    <tr>
      <td>{repair.asset}</td>
      <td>{repair.name}</td>
      <td>{repair.start_date}</td>
      <td>{repair.end_date}</td>
      <td>{repair.cost}</td>
      <td>
        <Status
          type={repair.statusType}
          name={repair.statusName}
          {...(repair.deployedTo && { personName: repair.deployedTo })}
        />
      </td>
    </tr>
  );
}

export default function AssetRepairs() {
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
    <>
      <section>
        <nav>
          <NavBar />
        </nav>

        <main className="page-layout">
          {/* Title of the Page */}
          <section className="title-page-section">
            <h1>Repairs</h1>
          </section>

          {/* Table Filter */}
          <RepairFilter filters={filterConfig} />

          <section className="table-layout">
            {/* Table Header */}
            <section className="table-header">
              <h2 className="h2">Asset Repairs ({MockupData.length})</h2>
              <section className="table-actions">
                <input
                  type="search"
                  placeholder="Search..."
                  className="search"
                />
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
                    paginatedActivity.map((repair, index) => (
                      <TableItem
                        key={index}
                        repair={repair}
                        onDeleteClick={() => setDeleteModalOpen(true)}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="no-data-message">
                        No repairs found.
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
      </section>
    </>
  );
}
