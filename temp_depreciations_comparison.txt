import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import Alert from "../../components/Alert";
import MediumButtons from "../../components/buttons/MediumButtons";
import MockupData from "../../data/mockData/more/asset-depreciation-mockup-data.json";
import contextsApi, { contextsBase } from '../../api/contextsApi'
import DepreciationFilterModal from "../../components/Modals/DepreciationFilterModal";
import Pagination from "../../components/Pagination";
import { exportToExcel } from "../../utils/exportToExcel";
import "../../styles/Depreciations.css";
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
  const navigate = useNavigate();

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
        <section className="action-button-section">
          <button
            title="Edit"
            className="action-button"
            onClick={() =>
              navigate(`/More/Depreciations/Edit/${depreciation.id}`, {
                state: { depreciation },
              })
            }
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            title="Delete"
            className="action-button"
            onClick={() => onDeleteClick(depreciation.id)}
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </section>
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
  const [allData, setAllData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({ valueSort: "" });
  const [searchQuery, setSearchQuery] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Apply filters to data
  const applyFilters = (filters) => {
    let filtered = [...MockupData];

    // Sort by Minimum Value (PHP) - greatest to least value
    if (filters.valueSort === "desc") {
      // Greatest to least value
      filtered = [...filtered].sort((a, b) => {
        const aValue = parseFloat(a.minimum_value || 0) || 0;
        const bValue = parseFloat(b.minimum_value || 0) || 0;
        return bValue - aValue;
      });
    } else if (filters.valueSort === "asc") {
      // Least to greatest value
      filtered = [...filtered].sort((a, b) => {
        const aValue = parseFloat(a.minimum_value || 0) || 0;
        const bValue = parseFloat(b.minimum_value || 0) || 0;
        return aValue - bValue;
      });
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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const searchedData =
    normalizedQuery === ""
      ? filteredData
      : filteredData.filter((item) => {
          const name = item.name?.toLowerCase() || "";
          const duration = String(item.duration ?? "").toLowerCase();
          const minimumValue = String(item.minimum_value ?? "").toLowerCase();
          return (
            name.includes(normalizedQuery) ||
            duration.includes(normalizedQuery) ||
            minimumValue.includes(normalizedQuery)
          );
        });

  // Handle export
  const handleExport = () => {
    const dataToExport = searchedData.length > 0 ? searchedData : filteredData;
    exportToExcel(dataToExport, "Depreciations_Records.xlsx");
    setExportToggle(false); // Close export menu after export
  };

  // Fetch depreciations from contexts API
  useEffect(() => {
    let mounted = true
    async function load() {
      setIsLoading(true)
      try {
        const res = await contextsApi.get('/depreciations/')
        const list = res.data.results ?? res.data
        if (!mounted) return
        setAllData(list)
        // Apply current filters/search to the returned list
        const normalized = searchQuery.trim().toLowerCase()
        const filtered = normalized === '' ? list : list.filter((item) => {
          const name = item.name?.toLowerCase() || '';
          const duration = String(item.duration ?? '').toLowerCase();
          const minimumValue = String(item.minimum_value ?? '').toLowerCase();
          return (
            name.includes(normalized) ||
            duration.includes(normalized) ||
            minimumValue.includes(normalized)
          );
        })
        setFilteredData(filtered)
      } catch (err) {
        console.error('Failed to fetch depreciations', err)
        setErrorMessage('Failed to load depreciations from server.')
      } finally {
        setIsLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [searchQuery])

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedActivity = searchedData.slice(startIndex, endIndex);

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

  const confirmDelete = async () => {
    try {
      if (deleteTarget) {
        const resp = await contextsApi.delete(`/depreciations/${deleteTarget}/`)
        // backend may return usage info; if so, surface a friendly message
        const respData = resp?.data ?? null
        if (respData && (respData.in_use || respData.skipped)) {
          setErrorMessage('The selected depreciation cannot be deleted; it is currently in use.')
          setTimeout(() => setErrorMessage(''), 5000)
          return { ok: false, data: { in_use: true } }
        }
        setSuccessMessage('Depreciation deleted successfully!')
      } else {
        if (selectedIds.length === 0) {
          setErrorMessage('No items selected for deletion.')
          setTimeout(() => setErrorMessage(''), 3000)
          return { ok: false, data: { error: 'no_selection' } }
        }

        const resp = await contextsApi.post('/depreciations/bulk_delete/', { ids: selectedIds })
        const data = resp?.data || {}
        const deletedCount = data?.deleted_count ?? (Array.isArray(data?.deleted) ? data.deleted.length : 0)
        const skippedCount = data?.skipped_count ?? (data?.skipped ? Object.keys(data.skipped).length : (data?.failed ? data.failed.length : 0))

        if (skippedCount > 0) {
          if (deletedCount > 0) {
            const parts = [`${deletedCount} depreciations deleted successfully`, `${skippedCount} skipped (in use)`]
            setSuccessMessage(parts.join('; ') + '.')
            // remove deleted ids from local lists if provided
            try {
              const deletedIds = data?.deleted_ids ?? (Array.isArray(data?.deleted) ? data.deleted : [])
              if (deletedIds && deletedIds.length) {
                setAllData((prev) => (prev || []).filter((p) => !deletedIds.includes(p.id)))
                setFilteredData((prev) => (prev || []).filter((p) => !deletedIds.includes(p.id)))
                setSelectedIds((prev) => (prev || []).filter((id) => !deletedIds.includes(id)))
              }
            } catch (e) {
              console.error('Failed to update local list after mixed delete', e)
            }
            setTimeout(() => setSuccessMessage(''), 5000)
            return { ok: true, data }
          }

          // only skipped
          setErrorMessage(`${skippedCount} depreciations skipped (currently in use).`)
          setTimeout(() => setErrorMessage(''), 5000)
          return { ok: false, data }
        }

        // fully deleted
        setSuccessMessage('Depreciations deleted successfully!')
        setSelectedIds([])
      }

      // Refresh list after delete to keep UI in sync
      try {
        const r = await contextsApi.get('/depreciations/')
        const list = r.data.results ?? r.data
        setAllData(list)
        setFilteredData(list)
      } catch (e) {
        console.error('Failed to refresh depreciations after delete', e)
      }

      // If bulk delete, reload to ensure server-side pagination/consistency
      if (!deleteTarget) {
        window.location.reload()
      }

      closeDeleteModal()
      setTimeout(() => setSuccessMessage(''), 5000)
      return { ok: true, data: null }
    } catch (err) {
      console.error('Delete failed', err)
      const respData = err?.response?.data
      const isUsage = respData && (respData.in_use || respData.skipped || (respData.error && typeof respData.error === 'string' && respData.error.toLowerCase().includes('use')) || (respData.detail && typeof respData.detail === 'string' && respData.detail.toLowerCase().includes('use')))
      if (isUsage) {
        const isMultiple = !deleteTarget && selectedIds && selectedIds.length > 1
        const msg = isMultiple ? 'The selected depreciations cannot be deleted. Currently in use!' : 'The selected depreciation cannot be deleted. Currently in use!'
        setErrorMessage(msg)
        setTimeout(() => setErrorMessage(''), 5000)
        return { ok: false, data: { in_use: true } }
      }

      const msg = respData?.detail || respData || err.message || 'Delete failed.'
      setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg))
      setTimeout(() => setErrorMessage(''), 5000)
      return { ok: false, data: { error: msg } }
    }
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
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}

      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          closeModal={closeDeleteModal}
          actionType={deleteTarget ? "delete" : "bulk-delete"}
          onConfirm={confirmDelete}
          targetIds={deleteTarget ? [deleteTarget] : selectedIds}
          selectedCount={deleteTarget ? 1 : selectedIds.length}
          entityType="depreciation"
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
          <section className="table-layout">
            {/* Table Header */}
            <section className="table-header">
              <h2 className="h2">Asset Depreciations ({searchedData.length})</h2>
              <section className="table-actions">
                {selectedIds.length > 0 && (
                  <MediumButtons
                    type="delete"
                    onClick={() => openDeleteModal(null)}
                  />
                )}
                <input
                  type="search"
                  placeholder="Search..."
                  className="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <MediumButtons
                  type="filter"
                  onClick={() => setIsFilterModalOpen(true)}
                />
                <MediumButtons
                  type="export"
                  onClick={handleExport}
                />
                <MediumButtons
                  type="new"
                  navigatePage="/More/Depreciations/Registration"
                />
              </section>
            </section>

            {/* Table Structure */}
            <section className="depreciation-page-table-section">
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
                      <td colSpan={5} className="no-data-message">
                        No Depreciations Found.
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
                totalItems={searchedData.length}
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

