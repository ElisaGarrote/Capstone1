import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "../../services/auth-service";
import NavBar from "../../components/NavBar";
import Status from "../../components/Status";
import MediumButtons from "../../components/buttons/MediumButtons";
import ComponentFilterModal from "../../components/Modals/ComponentFilterModal";
import Pagination from "../../components/Pagination";
import ActionButtons from "../../components/ActionButtons";
import ConfirmationModal from "../../components/Modals/DeleteModal";
import Alert from "../../components/Alert";
import Footer from "../../components/Footer";
import DefaultImage from "../../assets/img/default-image.jpg";
import MockupData from "../../data/mockData/components/component-mockup-data.json";
import { exportToExcel } from "../../utils/exportToExcel";

import "../../styles/components/Components.css";

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
      <th>IMAGE</th>
      <th>NAME</th>
      <th>CATEGORY</th>
      <th>MANUFACTURER</th>
      <th>DEPRECIATION</th>
      <th>CHECK-OUT / CHECK-IN</th>
      <th>ACTION</th>
    </tr>
  );
}

// TableItem component to render each asset row
function TableItem({ asset, isSelected, onRowChange, onDeleteClick, onViewClick, onCheckInOut }) {
  const baseImage = asset.image
    ? `https://assets-service-production.up.railway.app${asset.image}`
    : DefaultImage;

  return (
    <tr>
      <td>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onRowChange(asset.id, e.target.checked)}
        />
      </td>
      <td>
        <img
          src={baseImage}
          alt={asset.name}
          className="table-img"
          onError={(e) => {
            e.target.src = DefaultImage;
          }}
        />
      </td>
      <td>{asset.name}</td>
      <td>{asset.category || 'N/A'}</td>
      <td>{asset.manufacturer || 'N/A'}</td>
      <td>{asset.depreciation || 'N/A'}</td>

      {/* Check-out / Check-in Column */}
      <td>
        <ActionButtons
          showCheckout={asset.showCheckout}
          showCheckin={asset.showCheckin}
          onCheckoutClick={() => onCheckInOut(asset, 'checkout')}
          onCheckinClick={() => onCheckInOut(asset, 'checkin')}
        />
      </td>

      <td>
        <ActionButtons
          showEdit
          showDelete
          showView
          editPath={`/components/edit/${asset.id}`}
          editState={{ item: asset }}
          onDeleteClick={() => onDeleteClick(asset.id)}
          onViewClick={() => onViewClick(asset)}
        />
      </td>
    </tr>
  );
}

export default function Assets() {
  const location = useLocation();
  const navigate = useNavigate();

  // Base data with deterministic check-in/check-out visibility per component
  // Show Check-Out when there is available quantity; show Check-In when
  // there is some quantity currently checked out. This removes randomness
  // so the table renders the same way every time, even with mock data.
  const [baseData] = useState(() =>
    MockupData.map((asset) => {
      const available = asset.available_quantity ?? 0;
      const checkedOut = asset.checked_out_quantity ?? 0;

      const showCheckout = available > 0;
      const showCheckin = checkedOut > 0;

      return { ...asset, showCheckout, showCheckin };
    })
  );

  // Filter modal state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [filteredData, setFilteredData] = useState(baseData);

  // Debug: Monitor filter modal state changes
  useEffect(() => {
    console.log("🔍 Filter Modal State Changed:", isFilterModalOpen);
  }, [isFilterModalOpen]);

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // default page size or number of items per page

  // selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // Apply filters to data
  const applyFilters = (filters) => {
    let filtered = [...baseData];

    // Filter by Component Name
    if (filters.name && filters.name.trim() !== "") {
      filtered = filtered.filter((component) =>
        component.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    // Filter by Category
    if (filters.category && filters.category.label) {
      const categoryLabel = filters.category.label.toLowerCase();
      filtered = filtered.filter((component) =>
        component.category?.toLowerCase().includes(categoryLabel)
      );
    }

    // Filter by Manufacturer
    if (filters.manufacturer && filters.manufacturer.label) {
      const manufacturerLabel = filters.manufacturer.label.toLowerCase();
      filtered = filtered.filter((component) =>
        component.manufacturer?.toLowerCase().includes(manufacturerLabel)
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

  // paginate the data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAssets = filteredData.slice(startIndex, endIndex);

  // selection logic
  const allSelected =
    paginatedAssets.length > 0 &&
    paginatedAssets.every((item) => selectedIds.includes(item.id));

  const handleHeaderChange = (e) => {
    if (e.target.checked) {
      setSelectedIds((prev) => [
        ...prev,
        ...paginatedAssets.map((item) => item.id).filter((id) => !prev.includes(id)),
      ]);
    } else {
      setSelectedIds((prev) =>
        prev.filter((id) => !paginatedAssets.map((item) => item.id).includes(id))
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

  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  // delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null); // null = bulk, id = single

  const openDeleteModal = (id = null) => {
    setDeleteTarget(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      console.log("Deleting single id:", deleteTarget);
      // remove from mock data / API call
    } else {
      console.log("Deleting multiple ids:", selectedIds);
      // remove multiple
      setSelectedIds([]); // clear selection
    }
    closeDeleteModal();
  };


  const handleViewClick = (asset) => {
    navigate(`/assets/view/${asset.id}`);
  };

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

  const handleExport = () => {
    const dataToExport = filteredData.length > 0 ? filteredData : baseData;
    exportToExcel(dataToExport, "Assets_Records.xlsx");
  };

  const handleCheckInOut = (asset, action) => {
    // Build minimal mock item data expected by ComponentCheckout/ComponentCheckin
    const available_quantity = asset.available_quantity ?? 10;
    const remaining_quantity = asset.remaining_quantity ?? available_quantity;

    const item = {
      id: asset.id,
      name: asset.name,
      available_quantity,
      remaining_quantity,
    };

    if (action === 'checkin') {
      navigate(`/components/check-in/${asset.id}`, {
        state: {
          item,
          componentName: asset.name,
        },
      });
    } else {
      navigate(`/components/check-out/${asset.id}`, {
        state: { item },
      });
    }
  };



  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}

      {isDeleteModalOpen && (
        <ConfirmationModal
          closeModal={closeDeleteModal}
          actionType="delete"
          onConfirm={confirmDelete}
        />
      )}

      {/* Component Filter Modal */}
      <ComponentFilterModal
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
              <h2 className="h2">Components ({filteredData.length})</h2>
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
                <input type="search" placeholder="Search..." className="search" />
                <button
                  type="button"
                  className="medium-button-filter"
                  onClick={() => {
                    console.log("🔘 DIRECT FILTER BUTTON CLICKED!");
                    setIsFilterModalOpen(true);
                  }}
                >
                  Filter
                </button>
                <MediumButtons
                  type="export"
                  onClick={handleExport}
                />
                {authService.getUserInfo().role === "Admin" && (
                  <MediumButtons
                    type="new"
                    navigatePage="/components/registration"
                  />
                )}
              </section>
            </section>

            {/* Table Structure */}
            <section className="assets-table-section">
              <table>
                <thead>
                  <TableHeader
                    allSelected={allSelected}
                    onHeaderChange={handleHeaderChange}
                  />
                </thead>
                <tbody>
                  {paginatedAssets.length > 0 ? (
                    paginatedAssets.map((asset) => (
                      <TableItem
                        key={asset.id}
                        asset={asset}
                        isSelected={selectedIds.includes(asset.id)}
                        onRowChange={handleRowChange}
                        onDeleteClick={openDeleteModal}
                        onViewClick={handleViewClick}
                        onCheckInOut={handleCheckInOut}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="no-data-message">
                        No Assets Found.
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