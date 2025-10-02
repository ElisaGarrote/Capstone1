import { useEffect, useRef, useState } from "react";
import NavBar from "../../components/NavBar";
import Status from "../../components/Status";
import MediumButtons from "../../components/buttons/MediumButtons";
import MockupData from "../../data/mockData/more/asset-depreciation-mockup-data.json";
import DepreciationFilter from "../../components/FilterPanel";
import Pagination from "../../components/Pagination";
import { BsKeyboard } from "react-icons/bs";
import { LuDroplet } from "react-icons/lu"; 
import { HiOutlineTag } from "react-icons/hi";
import { AiOutlineAudit } from "react-icons/ai";
import { RxComponent1 } from "react-icons/rx";
import "../../styles/reports/ActivityReport.css";
import ActionButtons from "../../components/ActionButtons";


const filterConfig = [
  {
    type: "number",
    name: "duration",
    label: "Duration (in months)",
  },
  {
    type: "searchable",
    name: "depreciationname",
    label: "Name",
    options: [
      { value: "1", label: "Iphone Depreciation" },
      { value: "2", label: "Laptop Depreciation" },
      { value: "3", label: "Tablet Depreciation" },
      { value: "4", label: "Desktop Depreciation" },
      { value: "5", label: "Printer Depreciation" },
      { value: "6", label: "Scanner Depreciation" },
      { value: "7", label: "Projector Depreciation" },
    ],
  },
];

// TableHeader component to render the table header
function TableHeader() {
  return (
    <tr>
      <th>NAME</th>
      <th>DURATION</th>
      <th>MINIMUM VALUE</th>
      <th>ACITON</th>
    </tr>
  );
}

// TableItem component to render each row
function TableItem({  depreciation, onDeleteClick }) {
  return (
    <tr>
      <td>{depreciation.name}</td>
      <td>{depreciation.duration}</td>
      <td>{depreciation.minimum_value}</td>
      <td>
        <ActionButtons
          showEdit
          showDelete
          editPath="DepreciationEdit"
          editState={{ depreciation }}
          onDeleteClick={() => handleDelete(depreciation.id)}
        />
      </td>
    </tr>
  );
}

export default function Depreciations() {
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
            <h1>Depreciations</h1>
          </section>

          {/* Table Filter */}
          <DepreciationFilter filters={filterConfig} />

          <section className="table-layout">
            {/* Table Header */}
            <section className="table-header">
              <h2 className="h2">Asset Depreciations ({MockupData.length})</h2>
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
                    paginatedActivity.map((depreciation, index) => (
                      <TableItem
                        key={index}
                        depreciation={depreciation}
                        onDeleteClick={() => setDeleteModalOpen(true)}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="no-data-message">
                        No depreciations found.
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
