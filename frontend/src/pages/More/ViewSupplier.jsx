import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { SkeletonLoadingTable } from "../../components/Loading/LoadingSkeleton";
import NavBar from "../../components/NavBar";
import DeleteModal from "../../components/Modals/DeleteModal";
import MediumButtons from "../../components/buttons/MediumButtons";
import SupplierFilterModal from "../../components/Modals/SupplierFilterModal";
import Alert from "../../components/Alert";
import Pagination from "../../components/Pagination";
import Footer from "../../components/Footer";
import DefaultImage from "../../assets/img/default-image.jpg";
import { fetchAllSuppliers, deleteSupplier, bulkDeleteSuppliers } from "../../services/contexts-service";
import { exportToExcel } from "../../utils/exportToExcel";

import "../../styles/ViewSupplier.css";

// TableHeader component to render the table header
function TableHeader({ allChecked, onHeaderChange }) {
  return (
    <tr>
      <th>
        <input
          type="checkbox"
          name="checkbox-supplier"
          id="checkbox-supplier"
          checked={allChecked}
          onChange={(e) => onHeaderChange(e.target.checked)}
        />
      </th>
      <th>NAME</th>
      <th>ADDRESS</th>
      <th>CITY</th>
      <th>STATE</th>
      <th>ZIP</th>
      <th>COUNTRY</th>
      <th>CONTACT PERSON</th>
      <th>PHONE</th>
      <th>ACTIONS</th>
    </tr>
  );
}

// TableItem component to render each ticket row
function TableItem({ supplier, onDeleteClick, onViewClick, isChecked, onRowChange }) {
  const navigate = useNavigate();

  return (
    <tr>
      <td>
        <div className="checkbox-supplier">
          <input
            type="checkbox"
            name=""
            id=""
            checked={isChecked}
            onChange={(e) => onRowChange(supplier.id, e.target.checked)}
          />
        </div>
      </td>
      <td>
        <div className="supplier-name">
          <img
            src={supplier.logo ? supplier.logo : DefaultImage}
            alt={supplier.logo}
          />
          <Link
            to={`/More/SupplierDetails/${supplier.id}`}
            state={{ supplier }}
            className="supplier-name-link"
          >
            {supplier.name}
          </Link>
          {/* <span
            onClick={() =>
              navigate(`/More/SupplierDetails/${supplier.id}`, {
                state: { supplier },
              })
            }
          >
            {supplier.name}
          </span> */}
        </div>
      </td>
      <td>{supplier.address || "-"}</td>
      <td>{supplier.city || "-"}</td>
      <td>{supplier.state || "-"}</td>
      <td>{supplier.zip || "-"}</td>
      <td>{supplier.country || "-"}</td>
      <td>{supplier.contactName || "-"}</td>
      <td>{supplier.phoneNumber || "-"}</td>
      <td>
        <section className="action-button-section">
          <button
            title="View"
            className="action-button"
            onClick={() => onViewClick(supplier)}
          >
            <i className="fas fa-eye"></i>
          </button>
          <button
            title="Edit"
            className="action-button"
            onClick={() =>
              navigate(`/More/SupplierRegistration/${supplier.id}`, {
                state: { supplier },
              })
            }
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            title="Delete"
            className="action-button"
            onClick={onDeleteClick}
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </section>
      </td>
    </tr>
  );
}

export default function ViewSupplier() {
  const location = useLocation();
  const [isLoading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);
  const [endPoint, setEndPoint] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isAddRecordSuccess, setAddRecordSuccess] = useState(false);
  const [isUpdateRecordSuccess, setUpdateRecordSuccess] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // default page size or number of items per page

  // filter state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState({});



  // Apply filters to data
  const applyFilters = (filters) => {
    let filtered = [...MockupData];

    // Filter by City
    if (filters.city && filters.city.trim() !== "") {
      const cityQuery = filters.city.toLowerCase();
      filtered = filtered.filter((supplier) =>
        supplier.city?.toLowerCase().includes(cityQuery)
      );
    }

    // Filter by State
    if (filters.state && filters.state.trim() !== "") {
      const stateQuery = filters.state.toLowerCase();
      filtered = filtered.filter((supplier) =>
        supplier.state?.toLowerCase().includes(stateQuery)
      );
    }

    // Filter by Country
    if (filters.country && filters.country.trim() !== "") {
      const countryQuery = filters.country.toLowerCase();
      filtered = filtered.filter((supplier) =>
        supplier.country?.toLowerCase().includes(countryQuery)
      );
    }

    // Filter by Contact Person
    if (filters.contact && filters.contact.trim() !== "") {
      const contactQuery = filters.contact.toLowerCase();
      filtered = filtered.filter((supplier) => {
        const contactValue =
          supplier.contactName || supplier.contact_name || "";
        return contactValue.toLowerCase().includes(contactQuery);
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

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const searchedData =
    normalizedQuery === ""
      ? filteredData
      : filteredData.filter((supplier) => {
          const name = supplier.name?.toLowerCase() || "";
          const city = supplier.city?.toLowerCase() || "";
          const country = supplier.country?.toLowerCase() || "";
          const contact =
            supplier.contactName?.toLowerCase() ||
            supplier.contact_name?.toLowerCase() ||
            "";
          return (
            name.includes(normalizedQuery) ||
            city.includes(normalizedQuery) ||
            country.includes(normalizedQuery) ||
            contact.includes(normalizedQuery)
          );
        });

  // paginate the data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedSuppliers = searchedData.slice(startIndex, endIndex);

  const allChecked =
    paginatedSuppliers.length > 0 &&
    paginatedSuppliers.every((supplier) => checkedItems.includes(supplier.id));

  const handleHeaderChange = (checked) => {
    if (checked) {
      setCheckedItems((prev) => [
        ...prev,
        ...paginatedSuppliers
          .map((item) => item.id)
          .filter((id) => !prev.includes(id)),
      ]);
    } else {
      setCheckedItems((prev) =>
        prev.filter(
          (id) => !paginatedSuppliers.map((item) => item.id).includes(id)
        )
      );
    }
  };

  const handleRowChange = (id, isChecked) => {
    if (isChecked) {
      setCheckedItems((prev) => (prev.includes(id) ? prev : [...prev, id]));
    } else {
      setCheckedItems((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  // Retrieve the "addManufacturer" value passed from the navigation state.
  // If the "addManufacturer" is not exist, the default value for this is "undifiend".
  const addedSupplier = location.state?.addedSupplier;
  const updatedSupplier = location.state?.updatedSupplier;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const suppRes = await fetchAllSuppliers();
        const mapped = (suppRes || []).map((supp) => ({
          id: supp.id,
          name: supp.name,
          address: supp.address || supp.street || "",
          city: supp.city || "",
          state: supp.state_province || supp.state || "",
          zip: supp.zip || "",
          country: supp.country || "",
          contactName: supp.contact_name || supp.contactName || "",
          phoneNumber: supp.phone_number || supp.phoneNumber || "",
          email: supp.email || "",
          url: supp.url || supp.URL || supp.website || "",
          notes: supp.notes || "",
          logo: supp.logo || null,
        }));
        const sorted = mapped.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        setSuppliers(sorted);
        setFilteredData(sorted);
      } catch (error) {
        console.error("Fetch error:", error);
        setErrorMessage("Failed to load data.");
        setTimeout(() => setErrorMessage(""), 5000);
      } finally {
        setLoading(false);
      }
    };

    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setTimeout(() => {
        setSuccessMessage("");
        window.history.replaceState({}, document.title);
      }, 5000);
    }

    fetchData();
  }, [location]);

  const toggleSelectAll = () => {
    setCheckedItems(allChecked ? [] : suppliers.map((item) => item.id));
  };

  const toggleItem = (id) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetchAllSuppliers();
      const mapped = (res || []).map((supp) => ({
        id: supp.id,
        name: supp.name,
        address: supp.address,
        city: supp.city,
        zip: supp.zip,
        contactName: supp.contact_name,
        phoneNumber: supp.phone_number,
        email: supp.email,
        url: supp.URL,
        notes: supp.notes,
      }));
      setSuppliers(mapped);
    } catch (e) {
      console.error("Error refreshing suppplier:", e);
    } finally {
      setLoading(false);
    }
  };
  

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const actionStatus = (action, status) => {
    let timeoutId;

    if (action === "create" && status === true) {
      setAddRecordSuccess(true);
    }

    if (action === "update" && status === true) {
      setUpdateRecordSuccess(true);
    }

    // clear the navigation/history state so a full page refresh won't re-show the alert
    // replace the current history entry with an empty state
    navigate(location.pathname, { replace: true, state: {} });

    timeoutId = setTimeout(() => {
      if (action === "create") {
        setAddRecordSuccess(false);
      } else {
        setUpdateRecordSuccess(false);
      }
    }, 5000);

    return timeoutId;
  };

  const getAction = () => {
    if (addedSupplier == true) {
      return "create";
    }

    if (updatedSupplier == true) {
      return "update";
    }

    return null;
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
    return (async () => {
      try {
        if (deleteTarget) {
          // Single delete: call API and only remove from table on success
          const res = await deleteSupplier(deleteTarget);
          // deleteSupplier resolves on 2xx; if backend returned structured payload, try to use it
          setSuppliers((prev) => prev.filter((s) => s.id !== deleteTarget));
          setFilteredData((prev) => prev.filter((s) => s.id !== deleteTarget));
          setSuccessMessage(res?.detail || 'Supplier deleted successfully!');
        } else {
          if (!checkedItems || checkedItems.length === 0) {
            return { ok: false, data: { detail: 'No suppliers selected to delete' } };
          }
          const res = await bulkDeleteSuppliers(checkedItems);
          // Remove only ids reported as deleted by backend; keep skipped ones
          const deletedIds = (res && Array.isArray(res.deleted)) ? res.deleted : [];
          const skippedCount = res && res.skipped ? Object.keys(res.skipped).length : 0;

          if (deletedIds.length > 0) {
            setSuppliers((prev) => prev.filter((s) => !deletedIds.includes(s.id)));
            setFilteredData((prev) => prev.filter((s) => !deletedIds.includes(s.id)));
          }

          // If there are any skipped items, do NOT set success/error here; return structured result
          // so DeleteModal's onDeleteFail will render the combined message (deleted+skipped).
          if (skippedCount > 0) {
            setCheckedItems([]);
            return { ok: false, data: res };
          }

          // No skipped items -> show success for deleted count
          const deletedCount = deletedIds.length || 0;
          if (deletedCount > 0) {
            setSuccessMessage(`${deletedCount} supplier(s) deleted successfully!`);
            setTimeout(() => setSuccessMessage(''), 5000);
          }
          setCheckedItems([]);
        }
        setTimeout(() => setSuccessMessage(''), 5000);
        return { ok: true };
      } catch (err) {
        console.error('Delete error', err?.response || err);
        const payload = err?.response?.data || { detail: err?.message || 'Delete failed' };
        setErrorMessage(typeof payload === 'object' ? JSON.stringify(payload) : payload);
        setTimeout(() => setErrorMessage(''), 8000);
        return { ok: false, data: payload };
      } finally {
        closeDeleteModal();
      }
    })();
  };

  const handleExport = () => {
    const dataToExport = searchedData.length > 0 ? searchedData : filteredData;
    exportToExcel(dataToExport, "Supplier_Records.xlsx");
  };

  // Set the setAddRecordSuccess or setUpdateRecordSuccess state to true when trigger, then reset to false after 5 seconds.
  useEffect(() => {
    let timeoutId;

    timeoutId = actionStatus(getAction(), true);

    // cleanup the timeout on unmount or when addedManufacturer or updatedManufacturer changes
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [addedSupplier, updatedSupplier, navigate, location.pathname]);

  // Handle View button click
  const handleViewClick = (supplier) => {
    navigate(`/More/SupplierDetails/${supplier.id}`, {
      state: { supplier }
    });
  };

  // ----------------- Render -----------------
  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}

      {isAddRecordSuccess && (
        <Alert message="Supplier added successfully!" type="success" />
      )}

      {isUpdateRecordSuccess && (
        <Alert message="Supplier updated successfully!" type="success" />
      )}

      {isDeleteModalOpen && (
        <DeleteModal
          endPoint={endPoint}
          closeModal={closeDeleteModal}
          actionType="delete"
          onConfirm={confirmDelete}
          onDeleteFail={(payload) => {
            // Normalize payload (handlers sometimes return { ok:false, data: ... })
            let body = payload;
            if (payload && payload.data) body = payload.data;

            // If this is a bulk delete summary with deleted/skipped, show a single combined alert
            if (body && (body.deleted || body.skipped)) {
              const deletedCount = (body.deleted && body.deleted.length) || 0;
              const skippedCount = body.skipped ? Object.keys(body.skipped).length : 0;
              const deletedLabel = deletedCount === 1 ? 'supplier' : 'suppliers';
              const skippedLabel = skippedCount === 1 ? 'skipped (in use)' : 'skipped (in use)';
              const parts = [];
              if (deletedCount > 0) parts.push(`${deletedCount} ${deletedLabel} deleted successfully`);
              if (skippedCount > 0) parts.push(`${skippedCount} ${skippedLabel}`);
              const msg = parts.length ? parts.join('; ') + '.' : 'Delete failed.';
              // Show as successMessage when there were deletions, otherwise errorMessage
              if (deletedCount > 0) {
                setSuccessMessage(msg);
                setTimeout(() => setSuccessMessage(''), 5000);
              } else {
                setErrorMessage(msg);
                setTimeout(() => setErrorMessage(''), 5000);
              }
              return;
            }

            // If backend returned an explicit in-use or cannot-delete message, normalize to short client-friendly message
            try {
              const text = (body && (body.detail || body.error || body.message)) || (typeof body === 'string' ? body : null);
              if (text && /in use|cannot be deleted|cannot delete|currently in use/i.test(text)) {
                setErrorMessage('The selected supplier cannot be deleted. Currently in use!');
                setTimeout(() => setErrorMessage(''), 5000);
                return;
              }
            } catch (e) {
              // fallthrough to generic handling
            }

            // Fallback: prefer common fields, then skipped map, then fallback to JSON string
            let msg = null;
            try {
              if (!payload) msg = 'Delete failed';
              else if (typeof payload === 'string') msg = payload;
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
          selectedCount={deleteTarget ? 1 : checkedItems.length}
          /* BACKEND INTEGRATION HERE
          confirmDelete={async () => {
            await fetchSuppliers();
            setSuccessMessage("Supplier Deleted Successfully!");
            setTimeout(() => setSuccessMessage(""), 5000);
          }}
          onDeleteFail={() => {
            setErrorMessage("Delete failed. Please try again.");
            setTimeout(() => setErrorMessage(""), 5000);
          }}
          */
        />
      )}



      <SupplierFilterModal
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
              <h2 className="h2">Suppliers ({searchedData.length})</h2>
              <section className="table-actions">
                {checkedItems.length > 0 && (
                  <MediumButtons
                    type="delete"
                    onClick={() => openDeleteModal(null)}
                  />
                )}
                <input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="search"
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
                <MediumButtons type="export" onClick={handleExport} />
                <MediumButtons
                  type="new"
                  navigatePage="/More/SupplierRegistration"
                />
              </section>
            </section>

            {/* Table Structure */}
            <section className="supplier-page-table-section">
              <table>
                <thead>
                  <TableHeader
                    allChecked={allChecked}
                    onHeaderChange={handleHeaderChange}
                  />
                </thead>
                <tbody>
                  {paginatedSuppliers.length > 0 ? (
                    paginatedSuppliers.map((supplier, index) => (
                      <TableItem
                        key={index}
                        supplier={supplier}
                        isChecked={checkedItems.includes(supplier.id)}
                        onRowChange={handleRowChange}
                        onDeleteClick={() => {
                          /* BACKEND INTEGRATION HERE
                          setEndPoint(
                            `${contextServiceUrl}/contexts/suppliers/${supplier.id}/delete/`
                          ); */
                          openDeleteModal(supplier.id);
                        }}
                        onViewClick={handleViewClick}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="no-data-message">
                        No suppliers available.
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
