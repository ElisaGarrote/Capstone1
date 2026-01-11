import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Status from "../../components/Status";
import MediumButtons from "../../components/buttons/MediumButtons";
import { exportToExcel } from "../../utils/exportToExcel";
import MockupData from "../../data/mockData/reports/end-of-life-mockup-data.json";
import EndOfLifeFilterModal from "../../components/Modals/EndOfLifeFilterModal";
import Pagination from "../../components/Pagination";
import dateRelated from "../../utils/dateRelated";
import Footer from "../../components/Footer";
import "../../styles/Dashboard/UpcomingEndOfLife.css";

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
  const handleToggleFilter = () => setIsFilterModalOpen(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [filteredData, setFilteredData] = useState(MockupData);
  const [searchTerm, setSearchTerm] = useState("");

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

  const applyFiltersAndSearch = (filters, searchTerm) => {
    let filtered = applyFilters(filters);

    if (searchTerm && searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((item) =>
        (item.asset_id && item.asset_id.toLowerCase().includes(term)) ||
        (item.product && item.product.toLowerCase().includes(term)) ||
        (item.status_name && item.status_name.toLowerCase().includes(term)) ||
        (item.location && item.location.toLowerCase().includes(term))
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
  const paginatedDepreciation = filteredData.slice(startIndex, endIndex);

  useEffect(() => {
  }, []);

  const handleExport = () => {
    const dataToExport = filteredData.length > 0 ? filteredData : MockupData;
    exportToExcel(dataToExport, "EndOfLife_Warranty_Report.xlsx");
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
          <h1>End of Life & Warranty Report</h1>
        </section>

        <section className="table-layout">
          {/* Table Header */}
          <section className="table-header">
            <h2 className="h2">Asset ({filteredData.length})</h2>
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
              <EndOfLifeFilterModal
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
          <section className="eof-warranty-report-table-section">
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
