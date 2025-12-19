import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Status from "../../components/Status";
import MediumButtons from "../../components/buttons/MediumButtons";
import MockupData from "../../data/mockData/reports/end-of-life-mockup-data.json";
import EndOfLifeFilterModal from "../../components/Modals/EndOfLifeFilterModal";

import Pagination from "../../components/Pagination";
import dateRelated from "../../utils/dateRelated";
import Footer from "../../components/Footer";

import "../../styles/UpcomingEndOfLife.css";

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
    type: "date",
    name: "endoflifedate",
    label: "End of Life Date",
  },
  {
    type: "date",
    name: "warrantyexpirationdate",
    label: "Warranty Expiration Date",
  },
];

// TableHeader component to render the table header
function TableHeader() {
  return (
    <tr>
      <th>ASSET</th>
      <th>STATUS</th>
      <th>LOCATION</th>
      <th>END OF LIFE DATE</th>
      <th>WARRANTY EXPIRATION DATE</th>
    </tr>
  );
}

// TableItem component to render each ticket row
function TableItem({ asset, onDeleteClick }) {
  const navigate = useNavigate();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <tr>
      <td>
        {asset.asset_id} - {asset.product}
      </td>
      <td>
        <Status
          type={asset.status_type}
          name={asset.status_name}
          {...(asset.deployed_to && { personName: asset.deployed_to })}
        />
      </td>
      <td>{asset.location}</td>
      <td>{dateRelated.formatDate(asset.end_of_life_date)}</td>
      <td>{dateRelated.formatDate(asset.warranty_expiration_date)}</td>
    </tr>
  );
}

export default function EndOfLifeWarrantyReport() {
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [exportToggle, setExportToggle] = useState(false);
  const exportRef = useRef(null);
  const toggleRef = useRef(null);
  const handleToggleFilter = () => setIsFilterModalOpen(true);

  // filter modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [filteredData, setFilteredData] = useState(MockupData);

  const applyFilters = (filters) => {
    let filtered = [...MockupData];

    if (filters?.status) {
      filtered = filtered.filter(
        (row) => String(row.status_type || "").toLowerCase() === String(filters.status || "").toLowerCase()
      );
    }

    if (filters?.endoflifedate) {
      const target = new Date(filters.endoflifedate).toISOString().slice(0, 10);
      filtered = filtered.filter(
        (row) => new Date(row.end_of_life_date).toISOString().slice(0, 10) === target
      );
    }

    if (filters?.warrantyexpirationdate) {
      const target = new Date(filters.warrantyexpirationdate).toISOString().slice(0, 10);
      filtered = filtered.filter(
        (row) => new Date(row.warranty_expiration_date).toISOString().slice(0, 10) === target
      );
    }

    return filtered;
  };

  const handleApplyFilter = (filters) => {
    setAppliedFilters(filters);
    setFilteredData(applyFilters(filters));
    setCurrentPage(1);
  };

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // default page size or number of items per page

  // paginate the data (use filteredData)
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
    <section className="page-layout-with-table">
      <NavBar />

      <main className="main-with-table">
        {/* Title of the Page */}
        <section className="title-page-section">
          <h1>End of Life & Warranty Report</h1>
        </section>

        {/* Table Filter (modal used via Filter button) */}

        <section className="table-layout">
          {/* Table Header */}
          <section className="table-header">
            <h2 className="h2">Asset ({filteredData.length})</h2>
            <section className="table-actions">
              <input type="search" placeholder="Search..." className="search" />
              <button
                type="button"
                className="medium-button-filter"
                onClick={handleToggleFilter}
              >
                Filter
              </button>
              <EndOfLifeFilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                onApplyFilter={handleApplyFilter}
                initialFilters={appliedFilters}
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
          <section className="eof-warranty-report-table-section">
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
                    <td colSpan={5} className="no-data-message">
                      No end of life & warranty found.
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
