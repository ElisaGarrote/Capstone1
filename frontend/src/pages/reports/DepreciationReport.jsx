import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Status from "../../components/Status";
import MediumButtons from "../../components/buttons/MediumButtons";
import Pagination from "../../components/Pagination";
import DeleteModal from "../../components/Modals/DeleteModal";
import DepreciationFilterModal from "../../components/Modals/DepreciationFilterModal";
import Footer from "../../components/Footer";
import MockupData from "../../data/mockData/reports/depreciation-mockup-data.json";

import "../../styles/reports/DepreciationReport.css";

const filterConfig = [
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
    type: "select",
    name: "depreciation",
    label: "Depreciation",
    options: [
      { value: "iphonedepreciation", label: "iPhone Depreciation" },
      { value: "laptopdepreciation", label: "Laptop Depreciation" },
      { value: "tabletdepreciation", label: "Tablet Depreciaton" },
    ],
  },
  {
    type: "number",
    name: "duration",
    label: "Duration Months",
  },
  {
    type: "number",
    name: "monthsleft",
    label: "Months Left",
  },
];

// TableHeader component to render the table header
function TableHeader() {
  return (
    <tr>
      <th>ASSET</th>
      <th>STATUS</th>
      <th>DEPRECIATION</th>
      <th>DURATION</th>
      <th>MINIMUM VALUE</th>
      <th>PURCHASE COST</th>
      <th>CURRENT VALUE</th>
      <th>DEPRECIATED</th>
      <th>MONTHLY DEPRECIATION</th>
      <th>MONTHS LEFT</th>
    </tr>
  );
}

function TableItem({ asset, onDeleteClick }) {
  const navigate = useNavigate();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <tr>
      <td>
        {asset.assetId} - {asset.product}
      </td>
      <td>
        <Status
          type={asset.statusType}
          name={asset.statusName}
          {...(asset.deployedTo && { personName: asset.deployedTo })}
        />
      </td>
      <td>{asset.depreciationName}</td>
      <td>
        {asset.duration} {asset.duration > 1 ? "months" : "month"}
      </td>
      <td>
        {asset.currency} {asset.minimumValue.toFixed(2)}
      </td>
      <td>
        {asset.currency} {asset.purchaseCost.toFixed(2)}
      </td>
      <td>
        {asset.currency} {asset.currentValue.toFixed(2)}
      </td>
      <td>
        {asset.currency} {asset.depreciated.toFixed(2)}
      </td>
      <td>
        {asset.currency} {asset.monthlyDepreciation.toFixed(2)}
      </td>
      <td>{asset.monthsLeft}</td>
    </tr>
  );
}

export default function DepreciationReport() {
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [exportToggle, setExportToggle] = useState(false);
  const exportRef = useRef(null);
  const toggleRef = useRef(null);

  // filter modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [filteredData, setFilteredData] = useState(MockupData);

  const applyFilters = (filters) => {
    let filtered = [...MockupData];

    if (filters?.status) {
      filtered = filtered.filter(
        (row) =>
          row.statusType?.toLowerCase() === filters.status.value?.toLowerCase()
      );
    }

    if (filters?.depreciation) {
      filtered = filtered.filter(
        (row) =>
          row.depreciationName?.toLowerCase() ===
          String(filters.depreciation.value || "").toLowerCase()
      );
    }

    if (
      filters?.durationMonths &&
      String(filters.durationMonths).trim() !== ""
    ) {
      const duration = parseInt(filters.durationMonths, 10);
      if (!Number.isNaN(duration)) {
        filtered = filtered.filter((row) => row.duration === duration);
      }
    }

    if (filters?.monthsLeft && String(filters.monthsLeft).trim() !== "") {
      const monthsLeft = parseInt(filters.monthsLeft, 10);
      if (!Number.isNaN(monthsLeft)) {
        filtered = filtered.filter((row) => row.monthsLeft === monthsLeft);
      }
    }

    return filtered;
  };

  const handleApplyFilter = (filters) => {
    setAppliedFilters(filters);
    setFilteredData(applyFilters(filters));
    setCurrentPage(1);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedDepreciation = filteredData.slice(startIndex, endIndex);

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
      {isDeleteModalOpen && (
        <DeleteModal
          closeModal={() => setDeleteModalOpen(false)}
          actionType="delete"
        />
      )}

      <DepreciationFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilter={handleApplyFilter}
        initialFilters={appliedFilters}
      />

      <section className="page-layout-with-table">
        <NavBar />

        <main className="main-with-table">
          {/* Title of the Page */}
          <section className="title-page-section">
            <h1>Depreciation Report</h1>
          </section>

          <section className="table-layout">
            {/* Table Header */}
            <section className="table-header">
              <h2 className="h2">Asset Depreciation ({filteredData.length})</h2>
              <section className="table-actions">
                <input
                  type="search"
                  placeholder="Search..."
                  className="search"
                />
                <button
                  type="button"
                  className="medium-button-filter"
                  onClick={() => setIsFilterModalOpen(true)}
                >
                  Filter
                </button>
                <div ref={toggleRef}>
                  <MediumButtons
                    type="export"
                    onClick={() => setExportToggle(!exportToggle)}
                  />
                </div>
              </section>
            </section>

            {/* Table Structure */}
            <section className="depreciation-table-section">
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
                  {paginatedDepreciation.length > 0 ? (
                    paginatedDepreciation.map((asset, index) => (
                      <TableItem
                        key={index}
                        asset={asset}
                        onDeleteClick={() => setDeleteModalOpen(true)}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="no-data-message">
                        No depreciation found.
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
    </>
  );
}
