import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import MediumButtons from "../../components/buttons/MediumButtons";
import Pagination from "../../components/Pagination";
import ActionButtons from "../../components/ActionButtons";
import ConfirmationModal from "../../components/Modals/DeleteModal";
import RepairFilterModal from "../../components/Modals/RepairFilterModal";
import Alert from "../../components/Alert";
import Footer from "../../components/Footer";
import { exportToExcel } from "../../utils/exportToExcel";
import { SkeletonLoadingTable } from "../../components/Loading/LoadingSkeleton";
import authService from "../../services/auth-service";
import Status from "../../components/Status";
import "../../styles/Repairs/Repairs.css";
import { fetchAllRepairs } from "../../services/assets-service";
import { getUserFromToken } from "../../api/TokenUtils";

// TableHeader component to render the table header
function TableHeader({ allSelected, onHeaderChange }) {
  return (
    <tr>
      <th>
        <input
          type="checkbox"
          checked={allSelected}
          onChange={onHeaderChange}
        />
      </th>
      <th>ASSET ID</th>
      <th>ASSET NAME</th>
      <th>STATUS</th>
      <th>REPAIR TYPE</th>
      <th>REPAIR NAME</th>
      <th>START DATE</th>
      <th>END DATE</th>
      <th>COST</th>
      <th>ACTION</th>
    </tr>
  );
}

// TableItem component to render each repair row
function TableItem({
  repair,
  isSelected,
  onRowChange,
  onDeleteClick,
}) {
  return (
    <tr>
      <td>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onRowChange(repair.id, e.target.checked)}
        />
      </td>
      <td>{repair.asset_details?.asset_id}</td>
      <td>{repair.asset_details?.name}</td>
      <td>
        <Status
          type={
            repair.status_details?.name?.toLowerCase().includes('complete') 
              ? "passed" 
              : repair.status_details?.type || "repair"
          }
          name={repair.status_details?.name}
        />
      </td>
      <td>{repair.type}</td>
      <td>{repair.name}</td>
      <td>{repair.start_date}</td>
      <td>{repair.end_date || "N/A"}</td>
      <td>{repair.cost}</td>
      <td>
        <ActionButtons
          showEdit
          showDelete
          editPath={`/repairs/edit/${repair.id}`}
          onDeleteClick={() => onDeleteClick(repair.id)}
        />
      </td>
    </tr>
  );
}

export default function AssetRepairs() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const user = getUserFromToken();

  const [repairs, setRepairs] = useState([]);

  // Filter and data state
  const [filteredData, setFilteredData] = useState(repairs);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // Delete modal state
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Filter modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});

  // Alert state
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setTimeout(() => {
        setSuccessMessage("");
        window.history.replaceState({}, document.title);
      }, 5000);
    }
  }, [location]);

  // Fetch repairs on component mount
  useEffect(() => {
    const loadRepairs = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAllRepairs();
        setRepairs(data);
        setFilteredData(data);
      } catch (error) {
        setErrorMessage("Failed to load repairs.");
      } finally {
        setIsLoading(false);
      }
    };

    loadRepairs();
  }, []);

  // Paginate the data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRepairs = filteredData.slice(startIndex, endIndex);

  // Selection logic
  const allSelected =
    paginatedRepairs.length > 0 &&
    paginatedRepairs.every((item) => selectedIds.includes(item.id));

  const handleHeaderChange = (e) => {
    if (e.target.checked) {
      setSelectedIds((prev) => [
        ...prev,
        ...paginatedRepairs
          .map((item) => item.id)
          .filter((id) => !prev.includes(id)),
      ]);
    } else {
      setSelectedIds((prev) =>
        prev.filter(
          (id) => !paginatedRepairs.map((item) => item.id).includes(id)
        )
      );
    }
  };

  const handleRowChange = (id, checked) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  // Delete logic
  const openDeleteModal = (id = null) => {
    setDeleteTarget(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const handleDeleteSuccess = (deletedIds) => {
    if (Array.isArray(deletedIds)) {
      // Bulk delete
      setRepairs((prev) => prev.filter((r) => !deletedIds.includes(r.id)));
      setFilteredData((prev) => prev.filter((r) => !deletedIds.includes(r.id)));
      setSuccessMessage(`${deletedIds.length} repairs deleted successfully!`);
      setSelectedIds([]);
    } else {
      // Single delete
      setRepairs((prev) => prev.filter((r) => r.id !== deletedIds));
      setFilteredData((prev) => prev.filter((r) => r.id !== deletedIds));
      setSuccessMessage("Repair deleted successfully!");
    }
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  const handleDeleteError = (error) => {
    setErrorMessage(
      error.response?.data?.detail || "Failed to delete repair(s)."
    );
    setTimeout(() => setErrorMessage(""), 5000);
  };

  const handleExport = () => {
    const dataToExport = filteredData.length > 0 ? filteredData : repairs;
    exportToExcel(dataToExport, "Repairs_Records.xlsx");
  };

  // Apply filters to data
  const applyFilters = (filters) => {
    let filtered = [...repairs];

    // Filter by Asset
    if (filters.asset && filters.asset.trim() !== "") {
      filtered = filtered.filter((repair) =>
        repair.asset_details?.name
          ?.toLowerCase()
          .includes(filters.asset.toLowerCase())
      );
    }

    // Filter by Type
    if (filters.type) {
      filtered = filtered.filter(
        (repair) =>
          repair.type?.toLowerCase() === filters.type.value?.toLowerCase()
      );
    }

    // Filter by Name
    if (filters.name && filters.name.trim() !== "") {
      filtered = filtered.filter((repair) =>
        repair.name?.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    // Filter by Start Date
    if (filters.startDate && filters.startDate.trim() !== "") {
      filtered = filtered.filter(
        (repair) => repair.start_date === filters.startDate
      );
    }

    // Filter by End Date
    if (filters.endDate && filters.endDate.trim() !== "") {
      filtered = filtered.filter(
        (repair) => repair.end_date === filters.endDate
      );
    }

    // Filter by Cost
    if (filters.cost && filters.cost.trim() !== "") {
      const cost = parseFloat(filters.cost);
      filtered = filtered.filter((repair) => parseFloat(repair.cost) === cost);
    }

    // Filter by Status (compare status_details.id with filter value which is the status ID)
    if (filters.status) {
      filtered = filtered.filter(
        (repair) => repair.status_details?.id === filters.status.value
      );
    }

    return filtered;
  };

  // Combine modal filters and search term
  const applyFiltersAndSearch = (filters, term) => {
    let filtered = applyFilters(filters || {});

    if (term && term.trim() !== "") {
      const lowerTerm = term.toLowerCase();
      filtered = filtered.filter(
        (repair) =>
          (repair.name && repair.name.toLowerCase().includes(lowerTerm)) ||
          (repair.type && repair.type.toLowerCase().includes(lowerTerm)) ||
          (repair.asset_details?.name &&
            repair.asset_details.name.toLowerCase().includes(lowerTerm)) ||
          (repair.asset_details?.asset_id &&
            repair.asset_details.asset_id.toLowerCase().includes(lowerTerm))
      );
    }

    return filtered;
  };

  // Handle filter apply
  const handleApplyFilter = (filters) => {
    setAppliedFilters(filters);
    const filtered = applyFiltersAndSearch(filters, searchTerm);
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle search input
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setCurrentPage(1);
    const filtered = applyFiltersAndSearch(appliedFilters, term);
    setFilteredData(filtered);
  };

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}

      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          closeModal={closeDeleteModal}
          actionType={deleteTarget ? "delete" : "bulk-delete"}
          entityType="repair"
          targetId={deleteTarget}
          targetIds={selectedIds}
          onSuccess={handleDeleteSuccess}
          onError={handleDeleteError}
        />
      )}

      {/* Repair Filter Modal */}
      <RepairFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilter={handleApplyFilter}
        initialFilters={appliedFilters}
      />

      <section className="page-layout-with-table">
        <NavBar />

        <main className="main-with-table">
          <section className="table-layout">
            {/* Table Header */}
            <section className="table-header">
              <h2 className="h2">Asset Repairs ({filteredData.length})</h2>
              <section className="table-actions">
                {/* Bulk edit and delete buttons only when checkboxes selected */}
                {selectedIds.length > 0 && (
                  <>
                    <MediumButtons
                      type="delete"
                      onClick={() => openDeleteModal(null)}
                    />
                  </>
                )}
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
                  onClick={() => {
                    setIsFilterModalOpen(true);
                  }}
                >
                  Filter
                </button>
                {user?.roles?.[0]?.role === "Admin" && (
                  <MediumButtons type="export" onClick={handleExport} />
                )}

                <MediumButtons
                  type="new"
                  navigatePage="/repairs/registration"
                />
              </section>
            </section>

            {/* Table Structure */}
            <section className="repairs-table-section">
              {isLoading ? (
                <SkeletonLoadingTable />
              ) : (
                <table>
                  <thead>
                    <TableHeader
                      allSelected={allSelected}
                      onHeaderChange={handleHeaderChange}
                    />
                  </thead>
                  <tbody>
                    {paginatedRepairs.length > 0 ? (
                      paginatedRepairs.map((repair) => (
                        <TableItem
                          key={repair.id}
                          repair={repair}
                          isSelected={selectedIds.includes(repair.id)}
                          onRowChange={handleRowChange}
                          onDeleteClick={openDeleteModal}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="no-data-message">
                          No Repairs Found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
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
