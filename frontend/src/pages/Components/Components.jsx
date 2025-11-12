import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import MediumButtons from "../../components/buttons/MediumButtons";
import MockupData from "../../data/mockData/components/component-mockup-data.json";
import Pagination from "../../components/Pagination";
import ActionButtons from "../../components/ActionButtons";
import ConfirmationModal from "../../components/Modals/DeleteModal";
import ComponentFilterModal from "../../components/Modals/ComponentFilterModal";
import Alert from "../../components/Alert";
import Footer from "../../components/Footer";
import DefaultImage from "../../assets/img/default-image.jpg";
import { exportToExcel } from "../../utils/exportToExcel";

import "../../styles/Components/Components.css";

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

// TableItem component to render each component row
function TableItem({ component, isSelected, onRowChange, onDeleteClick, onViewClick, onCheckoutClick, onCheckinClick }) {
  const baseImage = component.image || DefaultImage;

  return (
    <tr>
      <td>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onRowChange(component.id, e.target.checked)}
        />
      </td>
      <td>
        <img
          src={baseImage}
          alt={component.name}
          className="table-img"
          onError={(e) => {
            e.target.src = DefaultImage;
          }}
        />
      </td>
      <td>{component.name}</td>
      <td>{component.category || 'N/A'}</td>
      <td>{component.manufacturer || 'N/A'}</td>
      <td>{component.depreciation || 'N/A'}</td>

      {/* Check-out/Check-in Column */}
      <td>
        <ActionButtons
          showCheckout={component.available_quantity > 0}
          showCheckin={component.checked_out_quantity > 0}
          onCheckoutClick={() => onCheckoutClick(component)}
          onCheckinClick={() => onCheckinClick(component)}
        />
      </td>

      <td>
        <ActionButtons
          showEdit
          showDelete
          showView
          editPath={`/components/edit/${component.id}`}
          editState={{ component }}
          onDeleteClick={() => onDeleteClick(component.id)}
          onViewClick={() => onViewClick(component)}
        />
      </td>
    </tr>
  );
}

export default function Components() {
  const navigate = useNavigate();

  // Filter and data state
  const [filteredData, setFilteredData] = useState(MockupData);

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

  // Paginate the data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedComponents = filteredData.slice(startIndex, endIndex);

  // Selection logic
  const allSelected =
    paginatedComponents.length > 0 &&
    paginatedComponents.every((item) => selectedIds.includes(item.id));

  const handleHeaderChange = (e) => {
    if (e.target.checked) {
      setSelectedIds((prev) => [
        ...prev,
        ...paginatedComponents.map((item) => item.id).filter((id) => !prev.includes(id)),
      ]);
    } else {
      setSelectedIds((prev) =>
        prev.filter((id) => !paginatedComponents.map((item) => item.id).includes(id))
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

  const handleViewClick = (component) => {
    navigate(`/components/view/${component.id}`);
  };

  const handleCheckout = (component) => {
    navigate(`/components/check-out/${component.id}`, { state: { component } });
  };

  const handleCheckin = (component) => {
    navigate(`/components/checked-out-list/${component.id}`, { state: { component } });
  };

  const handleExport = () => {
    const dataToExport = filteredData.length > 0 ? filteredData : MockupData;
    exportToExcel(dataToExport, "Components_Records.xlsx");
  };

  // Apply filters to data
  const applyFilters = (filters) => {
    let filtered = [...MockupData];

    // Filter by Name
    if (filters.name && filters.name.trim() !== "") {
      filtered = filtered.filter((component) =>
        component.name?.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    // Filter by Category
    if (filters.category) {
      filtered = filtered.filter((component) =>
        component.category?.toLowerCase() === filters.category.value?.toLowerCase()
      );
    }

    // Filter by Manufacturer
    if (filters.manufacturer) {
      filtered = filtered.filter((component) =>
        component.manufacturer?.toLowerCase() === filters.manufacturer.value?.toLowerCase()
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
                      type="edit"
                      onClick={() => navigate('/components/bulk-edit', { state: { selectedIds } })}
                    />
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
                    setIsFilterModalOpen(true);
                  }}
                >
                  Filter
                </button>
                <MediumButtons
                  type="export"
                  onClick={handleExport}
                />
                <MediumButtons
                  type="new"
                  navigatePage="/components/registration"
                />
              </section>
            </section>

            {/* Table Structure */}
            <section className="components-table-section">
              <table>
                <thead>
                  <TableHeader
                    allSelected={allSelected}
                    onHeaderChange={handleHeaderChange}
                  />
                </thead>
                <tbody>
                  {paginatedComponents.length > 0 ? (
                    paginatedComponents.map((component) => (
                      <TableItem
                        key={component.id}
                        component={component}
                        isSelected={selectedIds.includes(component.id)}
                        onRowChange={handleRowChange}
                        onDeleteClick={openDeleteModal}
                        onViewClick={handleViewClick}
                        onCheckoutClick={handleCheckout}
                        onCheckinClick={handleCheckin}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="no-data-message">
                        No Components Found.
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
