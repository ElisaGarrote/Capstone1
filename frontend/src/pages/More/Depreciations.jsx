import { useEffect, useRef, useState } from "react";
import NavBar from "../../components/NavBar";
import MediumButtons from "../../components/buttons/MediumButtons";
import MockupData from "../../data/mockData/more/asset-depreciation-mockup-data.json";
import DepreciationFilterModal from "../../components/Modals/DepreciationFilterModal";
import Pagination from "../../components/Pagination";
import "../../styles/Table.css";
import ActionButtons from "../../components/ActionButtons";
import ConfirmationModal from "../../components/Modals/DeleteModal";

// TableHeader
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
      <th>NAME</th>
      <th>DURATION</th>
      <th> MINIMUM VALUE</th>
      <th>ACTION</th>
    </tr>
  );
}

// TableItem
function TableItem({ depreciation, isSelected, onRowChange, onDeleteClick }) {
  return (
    <tr>
      <td>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onRowChange(depreciation.id, e.target.checked)}
        />
      </td>
      <td>{depreciation.name}</td>
      <td>{depreciation.duration}</td>
      <td>{depreciation.minimum_value}</td>
      <td>
        <ActionButtons
          showEdit
          showDelete
          editPath={`Edit/${depreciation.id}`}
          editState={{ depreciation }}
          onDeleteClick={() => onDeleteClick(depreciation.id)}
        />
      </td>
    </tr>
  );
}

export default function Depreciations() {
  const [exportToggle, setExportToggle] = useState(false);
  const exportRef = useRef(null);
  const toggleRef = useRef(null);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // filter state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filteredData, setFilteredData] = useState(MockupData);
  const [appliedFilters, setAppliedFilters] = useState({});

  // Apply filters to data
  const applyFilters = (filters) => {
    let filtered = [...MockupData];

    // Filter by Name
    if (filters.name && filters.name.trim() !== "") {
      filtered = filtered.filter((depreciation) =>
        depreciation.name?.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    // Filter by Duration
    if (filters.duration && filters.duration.toString().trim() !== "") {
      filtered = filtered.filter((depreciation) =>
        depreciation.duration?.toString().includes(filters.duration.toString())
      );
    }

    // Filter by Minimum Value
    if (filters.minimumValue && filters.minimumValue.toString().trim() !== "") {
      filtered = filtered.filter((depreciation) =>
        depreciation.minimumValue?.toString().includes(filters.minimumValue.toString())
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

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedActivity = filteredData.slice(startIndex, endIndex);

  // selection
  const [selectedIds, setSelectedIds] = useState([]);

  const allSelected =
    paginatedActivity.length > 0 &&
    paginatedActivity.every((item) => selectedIds.includes(item.id));

  const handleHeaderChange = (e) => {
    if (e.target.checked) {
      setSelectedIds((prev) => [
        ...prev,
        ...paginatedActivity.map((item) => item.id).filter((id) => !prev.includes(id)),
      ]);
    } else {
      setSelectedIds((prev) =>
        prev.filter((id) => !paginatedActivity.map((item) => item.id).includes(id))
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

  // delete modal state
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
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

  // outside click for export toggle
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
        <ConfirmationModal
          closeModal={closeDeleteModal}
          actionType="delete"
          onConfirm={confirmDelete}
        />
      )}

      <DepreciationFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilter={handleApplyFilter}
        initialFilters={appliedFilters}
      />

      <section>
        <nav>
          <NavBar />
        </nav>

        <main className="page-layout">
          <section className="table-layout">
            <section className="table-header">
              <h2 className="h2">Asset Depreciations ({filteredData.length})</h2>
              <section className="table-actions">
                {/* Bulk delete button only when checkboxes selected */}
                {selectedIds.length > 0 && (
                  <MediumButtons
                    type="delete"
                    onClick={() => openDeleteModal(null)}
                  />
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
                <div ref={toggleRef}>
                  <MediumButtons
                    type="export"
                    onClick={() => setExportToggle(!exportToggle)}
                  />
                </div>
                <MediumButtons
                  type="new"
                  navigatePage="/More/Depreciations/Registration"
                />
              </section>
            </section>

            {exportToggle && (
              <section className="export-button-section" ref={exportRef}>
                <button>Download as Excel</button>
                <button>Download as PDF</button>
                <button>Download as CSV</button>
              </section>
            )}

            <section className="table-section">
              <table>
                <thead>
                  <TableHeader
                    allSelected={allSelected}
                    onHeaderChange={handleHeaderChange}
                  />
                </thead>
                <tbody>
                  {paginatedActivity.length > 0 ? (
                    paginatedActivity.map((depreciation) => (
                      <TableItem
                        key={depreciation.id}
                        depreciation={depreciation}
                        isSelected={selectedIds.includes(depreciation.id)}
                        onRowChange={handleRowChange}
                        onDeleteClick={openDeleteModal}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="no-data-message">
                        No Depreciations Found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

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
      </section>
    </>
  );
}

