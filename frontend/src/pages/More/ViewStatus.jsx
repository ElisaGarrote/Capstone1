import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Pagination from "../../components/Pagination";
import MediumButtons from "../../components/buttons/MediumButtons";
import StatusFilterModal from "../../components/Modals/StatusFilterModal";
import DeleteModal from "../../components/Modals/DeleteModal";
import Status from "../../components/Status";
import api from "../../api";
import Alert from "../../components/Alert";
import Footer from "../../components/Footer";

import "../../styles/Category.css";

const systemDefaultStatus = [
  "Archived",
  "Being Repaired",
  "Broken",
  "Deployed",
  "Lost or Stolen",
  "Pending",
  "Ready to Deploy",
];

const isDefaultStatus = (status) => {
  const isDefault = systemDefaultStatus.some(
    (defaultStatus) => defaultStatus.toLowerCase() === status.name.toLowerCase()
  );

  return isDefault || status.tag > 0;
};

// TableHeader component to render the table header
function TableHeader({ allSelected, onHeaderChange }) {
  return (
    <tr>
      <th>
        <input
          type="checkbox"
          name="checkbox-status"
          id="checkbox-status"
          checked={allSelected}
          onChange={(e) => onHeaderChange(e.target.checked)}
        />
      </th>
      <th>NAME</th>
      <th>TYPE</th>
      <th>NOTES</th>
      <th>ASSETS</th>
      <th>ACTIONS</th>
    </tr>
  );
}

// TableItem component to render each ticket row
function TableItem({ status, onDeleteClick, isSelected, onRowChange }) {
  const navigate = useNavigate();

  const getTitle = (actionType, status) => {
    const isDefault = systemDefaultStatus.some(
      (defaultStatus) =>
        defaultStatus.toLowerCase() === status.name.toLowerCase()
    );

    const isInUseOrDefault = isDefault || status.tag > 0;

    if (isInUseOrDefault) {
      if (actionType === "delete") {
        return "This status is currently in use and cannot be deleted.";
      }
      return "This status is currently in use; only Notes can be edited.";
    }

    return actionType === "delete" ? "Delete" : "Edit";
  };

  const isInUse = isDefaultStatus(status);
  const disabledCheckboxOrDelete = isInUse; // keep delete button disabled when in use/default; allow checkbox selection for all
  const typeName = status.type ? status.type[0].toUpperCase() + status.type.slice(1) : "";

  return (
    <tr>
      <td>
        <div className="checkbox-status">
          <input
            type="checkbox"
            name=""
            id=""
            checked={isSelected}
            onChange={(e) => onRowChange(status.id, e.target.checked)}
            disabled={false}
          />
        </div>
      </td>
      <td>{status.name}</td>
      <td>
        <Status
          type={status.type || ""}
          name={typeName}
        />
      </td>
      <td>{status.notes || "-"}</td>
      <td>{status.tag}</td>
      <td>
        <section className="action-button-section">
          <button
            title={getTitle("edit", status)}
            className="action-button"
            onClick={() =>
              navigate(`/More/StatusEdit/${status.id}`, { state: { status, notesOnly: isInUse } })
            }
            disabled={false}
          >
            <i className="fas fa-edit"></i>
          </button>
          <span title={getTitle("delete", status)}>
            <button
              className="action-button"
              onClick={onDeleteClick}
              disabled={disabledCheckboxOrDelete}
            >
              <i className="fas fa-trash-alt"></i>
            </button>
          </span>
        </section>
      </td>
    </tr>
  );
}

const checkUsage = async (id) => {
  try {
    const response = await fetch(`/api/contexts/check-usage/status/${id}`);
    const data = await response.json();
    return data.in_use;
  } catch (error) {
    console.error("Error checking usage:", error);
    return true; // Assume in use on error
  }
};

const confirmDelete = async () => {
  if (deleteTarget) {
    const inUse = await checkUsage(deleteTarget);
    if (inUse) {
      setErrorMessage("Cannot delete: Status is in use.");
      return;
    }
    // Proceed with deletion logic
  }
};

export default function Category() {
  const location = useLocation();
  const navigate = useNavigate();
  const contextsBase = import.meta.env.VITE_CONTEXTS_API_URL || import.meta.env.VITE_API_URL || "/api/contexts/";

  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isAddRecordSuccess, setAddRecordSuccess] = useState(false);
  const [isUpdateRecordSuccess, setUpdateRecordSuccess] = useState(false);

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // default page size or number of items per page

  // filter state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Retrieve the "status" navigation flags for success alerts
  const addedStatus = location.state?.addedStatus;
  const updatedStatus = location.state?.updatedStatus;

  // Fetch statuses from backend API and normalize fields used by this page
  useEffect(() => {
    let cancelled = false;
    const fetchStatuses = async () => {
      try {
        const resp = await api.get(`${contextsBase}statuses/`);
        // Expecting an array of status objects
        const data = Array.isArray(resp.data) ? resp.data : resp.data.results || [];
        const normalized = data.map((s) => ({
          ...s,
          // frontend expects `tag` as assets count; backend may return `asset_count`
          tag: s.tag ?? s.asset_count ?? 0,
        }));
        if (!cancelled) setFilteredData(normalized);
      } catch (err) {
        console.error("Failed to load statuses:", err);
        if (!cancelled) setErrorMessage("Failed to load statuses from server.");
        setTimeout(() => setErrorMessage(""), 5000);
      }
    };

    fetchStatuses();
    return () => {
      cancelled = true;
    };
  }, []);

  const actionStatus = (action, status) => {
    let timeoutId;

    if (action === "create" && status === true) {
      setAddRecordSuccess(true);
    }

    if (action === "update" && status === true) {
      setUpdateRecordSuccess(true);
    }

    // clear the navigation/history state so a full page refresh won't re-show the alert
    navigate(location.pathname, { replace: true, state: {} });

    return (timeoutId = setTimeout(() => {
      if (action === "create") {
        setAddRecordSuccess(false);
      } else {
        setUpdateRecordSuccess(false);
      }
    }, 5000));
  };

  const getAction = () => {
    if (addedStatus == true) {
      return "create";
    }

    if (updatedStatus == true) {
      return "update";
    }

    return null;
  };

  // Set the setAddRecordSuccess or setUpdateRecordSuccess state to true when triggered, then reset to false after 5 seconds.
  useEffect(() => {
    let timeoutId;

    timeoutId = actionStatus(getAction(), true);

    // cleanup the timeout on unmount or when flags change
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [addedStatus, updatedStatus, navigate, location.pathname]);

  // Apply filters to data
  const applyFilters = (filters) => {
    let filtered = [...MockupData];

    // Sort by usage (Assets count)
    if (filters.usageSort === "desc") {
      filtered = [...filtered].sort(
        (a, b) => (b.tag || 0) - (a.tag || 0)
      );
    } else if (filters.usageSort === "asc") {
      filtered = [...filtered].sort(
        (a, b) => (a.tag || 0) - (b.tag || 0)
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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const searchedData =
    normalizedQuery === ""
      ? filteredData
      : filteredData.filter((status) => {
          const name = status.name?.toLowerCase() || "";
          const type = status.type?.toLowerCase() || "";
          const notes = status.notes?.toLowerCase() || "";
          return (
            name.includes(normalizedQuery) ||
            type.includes(normalizedQuery) ||
            notes.includes(normalizedQuery)
          );
        });

  // paginate the data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCategories = searchedData.slice(startIndex, endIndex);

  // Allow selection (checkbox) for all visible statuses
  const selectableStatuses = paginatedCategories;

  const allSelected =
    selectableStatuses.length > 0 &&
    selectableStatuses.every((status) => selectedIds.includes(status.id));

  const handleHeaderChange = (checked) => {
    if (checked) {
      setSelectedIds((prev) => [
        ...prev,
        ...selectableStatuses
          .map((status) => status.id)
          .filter((id) => !prev.includes(id)),
      ]);
    } else {
      setSelectedIds((prev) =>
        prev.filter(
          (id) => !selectableStatuses.map((status) => status.id).includes(id)
        )
      );
    }
  };

  const handleRowChange = (id, checked) => {
    if (checked) {
      setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
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

  // Called by DeleteModal via its `onConfirm` prop. Must return { ok: true, data } on success
  const performDelete = async () => {
    setIsProcessingDelete(true);
    try {
      // single delete
      if (deleteTarget) {
        const res = await api.delete(`${contextsBase}statuses/${deleteTarget}/`);
        return { ok: true, data: deleteTarget };
      }

      // bulk delete using selectedIds
      if (selectedIds.length > 0) {
        const res = await api.post(`${contextsBase}statuses/bulk_delete/`, { ids: selectedIds });
        // backend returns a summary object; treat non-empty `failed` or `skipped_count` as partial failure
        const payload = res.data ?? res;
        const skipped = payload?.skipped_count ?? payload?.skipped ?? 0;
        const failed = payload?.failed ?? payload?.failed_ids ?? [];
        const deletedIds = payload?.deleted_ids ?? (skipped ? [] : selectedIds);

        if ((Array.isArray(failed) && failed.length > 0) || skipped > 0) {
          return { ok: false, data: payload };
        }

        return { ok: true, data: deletedIds };
      }

      return { ok: false, data: 'No target selected' };
    } catch (error) {
      return { ok: false, data: error.response?.data ?? error.message ?? String(error) };
    } finally {
      setIsProcessingDelete(false);
    }
  };

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}

      {isAddRecordSuccess && (
        <Alert message="Status added successfully!" type="success" />
      )}

      {isUpdateRecordSuccess && (
        <Alert message="Status updated successfully!" type="success" />
      )}

      {isDeleteModalOpen && (
        <DeleteModal
          closeModal={closeDeleteModal}
          isOpen={isDeleteModalOpen}
          actionType={deleteTarget || selectedIds.length > 0 ? (deleteTarget ? "delete" : "bulk-delete") : "delete"}
          entityType="status"
          targetId={deleteTarget}
          targetIds={deleteTarget ? undefined : selectedIds}
          onConfirm={performDelete}
          onSuccess={(deleted) => {
            if (Array.isArray(deleted)) {
              setFilteredData((prev) => prev.filter((s) => !deleted.includes(s.id)));
              setSelectedIds([]);
              setSuccessMessage(`${deleted.length} statuses deleted successfully!`);
            } else {
              setFilteredData((prev) => prev.filter((s) => s.id !== deleted));
              setSuccessMessage("Status deleted successfully!");
            }
            setTimeout(() => setSuccessMessage(""), 5000);
          }}
          onDeleteFail={(payload) => {
            console.error('Bulk delete partial failure:', payload);
            // Normalize payload shape: some callers return { ok:false, data: ... }
            let body = payload && payload.data ? payload.data : payload;

            const deletedIds = body?.deleted_ids ?? (Array.isArray(body?.deleted) ? body.deleted : []);
            const deletedCount = body?.deleted_count ?? (deletedIds ? deletedIds.length : 0) ?? 0;
            const skippedCount = body?.skipped_count ?? (body?.skipped ? Object.keys(body.skipped).length : 0) ?? 0;
            const failedEntries = Array.isArray(body?.failed) ? body.failed : [];

            // If there are failed messages, prefer to show them, but still present combined summary when available
            const failedMsgs = failedEntries.map((f) => (f && f.message ? f.message : JSON.stringify(f))).filter(Boolean);
            if (failedMsgs.length > 0) {
              if (deletedCount > 0 || skippedCount > 0) {
                const parts = [];
                if (deletedCount > 0) parts.push(`${deletedCount} status(es) deleted successfully`);
                if (skippedCount > 0) parts.push(`${skippedCount} skipped (in use)`);
                const summary = parts.join('; ') + '.';
                if (deletedCount > 0) {
                  setSuccessMessage(summary);
                  setTimeout(() => setSuccessMessage(''), 5000);
                } else {
                  setErrorMessage(summary);
                  setTimeout(() => setErrorMessage(''), 7000);
                }
              } else {
                setErrorMessage(failedMsgs.join('; '));
                setTimeout(() => setErrorMessage(''), 7000);
              }

              // Remove any successfully deleted ids from UI
              try {
                if (deletedIds && deletedIds.length) {
                  setFilteredData((prev) => (prev || []).filter((s) => !deletedIds.includes(s.id)));
                  setSelectedIds((prev) => (prev || []).filter((id) => !deletedIds.includes(id)));
                }
              } catch (e) {
                console.error('Failed to apply partial-delete UI update', e);
              }

              return;
            }

            // Mixed summary — show combined deleted/skipped message and update UI
            if (deletedCount > 0 || skippedCount > 0) {
              const parts = [];
              if (deletedCount > 0) parts.push(`${deletedCount} status(es) deleted successfully`);
              if (skippedCount > 0) parts.push(`${skippedCount} skipped (in use)`);
              const msg = parts.join('; ') + '.';
              if (deletedCount > 0) {
                setSuccessMessage(msg);
                setTimeout(() => setSuccessMessage(''), 5000);
              } else {
                setErrorMessage(msg);
                setTimeout(() => setErrorMessage(''), 7000);
              }

              try {
                if (deletedIds && deletedIds.length) {
                  setFilteredData((prev) => (prev || []).filter((s) => !deletedIds.includes(s.id)));
                  setSelectedIds((prev) => (prev || []).filter((id) => !deletedIds.includes(id)));
                }
                // Keep skipped items selected
                if (body?.skipped) {
                  const skippedIds = Array.isArray(body.skipped) ? body.skipped : Object.keys(body.skipped).map((k) => (isNaN(Number(k)) ? k : Number(k)));
                  if (skippedIds && skippedIds.length) setSelectedIds(skippedIds);
                }
              } catch (e) { console.error('Failed to apply mixed-delete UI update', e); }
              return;
            }

            // Fallback message extraction
            let msg = null;
            try {
              if (!body) msg = 'Delete failed';
              else if (typeof body === 'string') msg = body;
              else if (body.detail) msg = body.detail;
              else if (body.message) msg = body.message;
              else if (body.error) msg = body.error;
              else if (body.skipped && typeof body.skipped === 'object') {
                const vals = Object.values(body.skipped).filter(Boolean);
                msg = vals.length ? vals.join('; ') : 'Some items could not be deleted.';
              } else {
                msg = JSON.stringify(body);
              }
            } catch (e) {
              msg = 'Delete failed';
            }

            setErrorMessage(msg);
            setTimeout(() => setErrorMessage(''), 5000);
          }}
          onError={(err) => {
            console.error('Delete error:', err);
            const message = err?.response?.data?.detail ?? err?.response?.data ?? err?.message ?? 'Delete failed';
            setErrorMessage(typeof message === 'string' ? message : JSON.stringify(message));
            setTimeout(() => setErrorMessage(""), 7000);
          }}
        />
      )}

      <StatusFilterModal
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
              <h2 className="h2">Statuses ({searchedData.length})</h2>
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
                  type="new"
                  navigatePage="/More/StatusRegistration"
                />
              </section>
            </section>

            {/* Table Structure */}
            <section className="table-section">
              <table>
                <thead>
                  <TableHeader
                    allSelected={allSelected}
                    onHeaderChange={handleHeaderChange}
                  />
                </thead>
                <tbody>
                  {paginatedCategories.length > 0 ? (
                    paginatedCategories.map((status, index) => (
                      <TableItem
                        key={index}
                        status={status}
                        isSelected={selectedIds.includes(status.id)}
                        onRowChange={handleRowChange}
                        onDeleteClick={() => openDeleteModal(status.id)}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="no-data-message">
                        No statuses found.
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
