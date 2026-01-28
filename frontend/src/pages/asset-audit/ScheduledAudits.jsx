import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "../../services/auth-service";
import NavBar from "../../components/NavBar";
import MediumButtons from "../../components/buttons/MediumButtons";
import Pagination from "../../components/Pagination";
import "../../styles/Table.css";
import ActionButtons from "../../components/ActionButtons";
import ConfirmationModal from "../../components/Modals/DeleteModal";
import TableBtn from "../../components/buttons/TableButtons";
import TabNavBar from "../../components/TabNavBar";
import "../../styles/Audits.css";
import View from "../../components/Modals/View";
import Footer from "../../components/Footer";
import DueAuditFilterModal from "../../components/Modals/DueAuditFilterModal";
import { exportToExcel } from "../../utils/exportToExcel";
import { fetchScheduledAudits } from "../../services/assets-service";
import Alert from "../../components/Alert";

// TableHeader
function TableHeader() {
  return (
    <tr>
      <th>DUE DATE</th>
      <th>ASSET</th>
      <th>CREATED</th>
      <th>AUDIT</th>
      <th>ACTION</th>
    </tr>
  );
}

// TableItem
function TableItem({ item, onDeleteClick, onViewClick }) {
  const assetDetails = item.asset_details || {};
  return (
    <tr>
      <td>{item.date}</td>
      <td>
        {assetDetails.asset_id || "N/A"} -{" "}
        {assetDetails.name || "Unknown Asset"}
      </td>
      <td>{new Date(item.created_at).toLocaleDateString()}</td>
      <td>
        <TableBtn
          type="audit"
          navigatePage="/audits/new"
          data={item}
          previousPage={location.pathname}
        />
      </td>
      <td>
        <ActionButtons
          showEdit
          showDelete
          showView
          editPath={`edit/${item.id}`}
          editState={{ item, previousPage: "/audits/scheduled" }}
          onDeleteClick={() => onDeleteClick(item.id)}
          onViewClick={() => onViewClick(item)}
        />
      </td>
    </tr>
  );
}

export default function ScheduledAudits() {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [successMessage, setSuccessMessage] = useState(
    location.state?.successMessage || ""
  );

  // Clear success message from navigation state after reading it once
  useEffect(() => {
    if (location.state?.successMessage) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  // Fetch scheduled audits on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchScheduledAudits();
        setData(result);
      } catch (err) {
        console.error("Error fetching scheduled audits:", err);
        setError("Failed to load scheduled audits");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [filteredData, setFilteredData] = useState([]);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedActivity =
    filteredData.length > 0
      ? filteredData.slice(startIndex, endIndex)
      : data.slice(startIndex, endIndex);

  // delete modal state
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteId(null);
  };

  const handleDeleteSuccess = (deletedId) => {
    setData(data.filter((item) => item.id !== deletedId));
    setRefreshKey((prev) => prev + 1); // Trigger TabNavBar refresh
    setSuccessMessage("Audit schedule deleted successfully.");
    closeDeleteModal();
  };

  const handleDeleteError = (err) => {
    console.error("Error deleting audit schedule:", err);
    alert("Failed to delete audit schedule");
  };

  // Add state for view modal
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Add view handler
  const handleViewClick = (item) => {
    setSelectedItem(item);
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setSelectedItem(null);
  };

  // Apply filters to data
  const applyFilters = (filters) => {
    let filtered = [...data];

    // Filter by Due Date
    if (filters.dueDate && filters.dueDate.trim() !== "") {
      filtered = filtered.filter((audit) => {
        const auditDate = new Date(audit.date);
        const filterDate = new Date(filters.dueDate);
        return auditDate.toDateString() === filterDate.toDateString();
      });
    }

    // Filter by Asset
    if (filters.asset && filters.asset.trim() !== "") {
      filtered = filtered.filter((audit) =>
        audit.asset_details?.name
          ?.toLowerCase()
          .includes(filters.asset.toLowerCase())
      );
    }

    // Filter by Created
    if (filters.created && filters.created.trim() !== "") {
      filtered = filtered.filter((audit) => {
        const createdDate = new Date(audit.created_at);
        const filterDate = new Date(filters.created);
        return createdDate.toDateString() === filterDate.toDateString();
      });
    }

    // Filter by Audit
    if (filters.audit && filters.audit.trim() !== "") {
      filtered = filtered.filter((audit) =>
        audit.notes?.toLowerCase().includes(filters.audit.toLowerCase())
      );
    }

    return filtered;
  };

  // Handle filter apply
  const handleApplyFilter = (filters) => {
    setAppliedFilters(filters);
    const filtered = applyFilters(filters);
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleExport = () => {
    const baseData = data;
    const dataToExport = filteredData.length > 0 ? filteredData : baseData;
    exportToExcel(dataToExport, "Scheduled_Audits.xlsx");
  };

  return (
    <>
      {successMessage && <Alert message={successMessage} type="success" />}
      {isDeleteModalOpen && (
        <ConfirmationModal
          closeModal={closeDeleteModal}
          actionType="delete"
          entityType="audit-schedule"
          targetId={deleteId}
          onSuccess={handleDeleteSuccess}
          onError={handleDeleteError}
        />
      )}

      {isViewModalOpen && selectedItem && (
        <View
          title={`${selectedItem.asset_details?.name || "Unknown"} : ${
            selectedItem.date
          }`}
          data={[
            { label: "Due Date", value: selectedItem.date },
            {
              label: "Asset",
              value: `${selectedItem.asset_details?.asset_id || "N/A"} - ${
                selectedItem.asset_details?.name || "Unknown"
              }`,
            },
            {
              label: "Created At",
              value: new Date(selectedItem.created_at).toLocaleDateString(),
            },
            { label: "Notes", value: selectedItem.notes || "N/A" },
          ]}
          closeModal={closeViewModal}
        />
      )}

      {/* Due Audit Filter Modal */}
      <DueAuditFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilter={handleApplyFilter}
        initialFilters={appliedFilters}
      />

      <section className="page-layout-with-table">
        <NavBar />

        <main className="main-with-table audit-layout">
          <section className="audit-title-page-section">
            <h1>Asset Audits</h1>

            <div>
              <MediumButtons
                type="schedule-audits"
                navigatePage="/audits/schedule"
                previousPage="/audits/scheduled"
              />
              <MediumButtons
                type="perform-audits"
                navigatePage="/audits/new"
                previousPage={location.pathname}
              />
            </div>
          </section>

          <section>
            <TabNavBar refreshKey={refreshKey} />
          </section>

          <section className="table-layout">
            <section className="table-header">
              <h2 className="h2">
                Scheduled Audits (
                {filteredData.length > 0 ? filteredData.length : data.length})
              </h2>
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
                {authService.getUserInfo().role === "Admin" && (
                  <MediumButtons type="export" onClick={handleExport} />
                )}
              </section>
            </section>

            <section className="audit-table-section">
              {loading ? (
                <p className="loading-message">Loading scheduled audits...</p>
              ) : error ? (
                <p className="error-message">{error}</p>
              ) : (
                <table>
                  <thead>
                    <TableHeader />
                  </thead>
                  <tbody>
                    {paginatedActivity.length > 0 ? (
                      paginatedActivity.map((item) => (
                        <TableItem
                          key={item.id}
                          item={item}
                          onDeleteClick={openDeleteModal}
                          onViewClick={handleViewClick}
                          navigate={navigate}
                          location={location}
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="no-data-message">
                          No Scheduled Audits Found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </section>

            <section className="table-pagination">
              <Pagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={data.length}
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
