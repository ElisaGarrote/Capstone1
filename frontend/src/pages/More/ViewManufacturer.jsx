import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Pagination from "../../components/Pagination";
import MediumButtons from "../../components/buttons/MediumButtons";
import ManufacturerFilterModal from "../../components/Modals/ManufacturerFilterModal";
import DeleteModal from "../../components/Modals/DeleteModal";
import Alert from "../../components/Alert";
import DefaultImage from "../../assets/img/default-image.jpg";
import Footer from "../../components/Footer";
import MockupData from "../../data/mockData/more/manufacturer-mockup-data.json";
import { exportToExcel } from "../../utils/exportToExcel";

import "../../styles/Manufacturer.css";

// TableHeader component to render the table header
function TableHeader({ allChecked, onHeaderChange }) {
  return (
    <tr>
      <th>
        <input
          type="checkbox"
          name="checkbox-manufacturer"
          id="checkbox-manufacturer"
          checked={allChecked}
          onChange={(e) => onHeaderChange(e.target.checked)}
        />
      </th>
      <th>NAME</th>
      <th>URL</th>
      <th>SUPPORT URL</th>
      <th>PHONE NUMBER</th>
      <th>EMAIL</th>
      <th>NOTES</th>
      <th>ACTIONS</th>
    </tr>
  );
}

// TableItem component to render each ticket row
function TableItem({ manufacturer, onDeleteClick, isChecked, onRowChange }) {
  const navigate = useNavigate();

  return (
    <tr>
      <td>
        <div className="checkbox-manufacturer">
          <input
            type="checkbox"
            name=""
            id=""
            checked={isChecked}
            onChange={(e) => onRowChange(manufacturer.id, e.target.checked)}
          />
        </div>
      </td>
      <td>
        <div className="manufacturer-name">
          <img
            src={manufacturer.logo ? manufacturer.logo : DefaultImage}
            alt={manufacturer.logo}
          />
          <span>{manufacturer.name}</span>
        </div>
      </td>
      <td>{manufacturer.url || "-"}</td>
      <td>{manufacturer.support_url || "-"}</td>
      <td>{manufacturer.phone_number || "-"}</td>
      <td>{manufacturer.email || "-"}</td>
      <td>{manufacturer.notes || "-"}</td>
      <td>
        <section className="action-button-section">
          <button
            title="Edit"
            className="action-button"
            onClick={() =>
              navigate(`/More/ManufacturerRegistration/${manufacturer.id}`, {
                state: { manufacturer },
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

export default function ViewManuDraft() {
  const location = useLocation();
  const [isLoading, setLoading] = useState(true);
  const [manufacturers, setManufacturers] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);
  const [endPoint, setEndPoint] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isAddRecordSuccess, setAddRecordSuccess] = useState(false);
  const [isUpdateRecordSuccess, setUpdateRecordSuccess] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // default page size or number of items per page

  // filter state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filteredData, setFilteredData] = useState(MockupData);
  const [appliedFilters, setAppliedFilters] = useState({});

  // Apply filters to data
  const applyFilters = (filters) => {
    let filtered = [...MockupData];

    // Filter by Name
    if (filters.name && filters.name.trim() !== "") {
      filtered = filtered.filter((manufacturer) =>
        manufacturer.name?.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    // Filter by URL
    if (filters.url && filters.url.trim() !== "") {
      filtered = filtered.filter((manufacturer) =>
        manufacturer.url?.toLowerCase().includes(filters.url.toLowerCase())
      );
    }

    // Filter by Email
    if (filters.email && filters.email.trim() !== "") {
      filtered = filtered.filter((manufacturer) =>
        manufacturer.email?.toLowerCase().includes(filters.email.toLowerCase())
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

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const searchedData =
    normalizedQuery === ""
      ? filteredData
      : filteredData.filter((manufacturer) => {
          const name = manufacturer.name?.toLowerCase() || "";
          const url = manufacturer.url?.toLowerCase() || "";
          const supportUrl =
            manufacturer.support_url?.toLowerCase() ||
            manufacturer.supportUrl?.toLowerCase() ||
            "";
          const email = manufacturer.email?.toLowerCase() || "";
          const phone =
            manufacturer.phone_number?.toLowerCase() ||
            manufacturer.support_phone?.toLowerCase() ||
            "";
          return (
            name.includes(normalizedQuery) ||
            url.includes(normalizedQuery) ||
            supportUrl.includes(normalizedQuery) ||
            email.includes(normalizedQuery) ||
            phone.includes(normalizedQuery)
          );
        });

  // paginate the data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedManufacturer = searchedData.slice(startIndex, endIndex);

  const allChecked =
    paginatedManufacturer.length > 0 &&
    paginatedManufacturer.every((item) => checkedItems.includes(item.id));

  const handleHeaderChange = (checked) => {
    if (checked) {
      setCheckedItems((prev) => [
        ...prev,
        ...paginatedManufacturer
          .map((item) => item.id)
          .filter((id) => !prev.includes(id)),
      ]);
    } else {
      setCheckedItems((prev) =>
        prev.filter(
          (id) => !paginatedManufacturer.map((item) => item.id).includes(id)
        )
      );
    }
  };

  const handleRowChange = (id, checked) => {
    if (checked) {
      setCheckedItems((prev) => (prev.includes(id) ? prev : [...prev, id]));
    } else {
      setCheckedItems((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  // Retrieve the "addManufacturer" value passed from the navigation state.
  // If the "addManufacturer" is not exist, the default value for this is "undifiend".
  const addedManufacturer = location.state?.addedManufacturer;
  const updatedManufacturer = location.state?.updatedManufacturer;

  console.log("value", addedManufacturer);

  /* BACKEND INTEGRATION HERE
  const contextServiceUrl =
    "https://contexts-service-production.up.railway.app";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const manufacturerRes = await fetchAllCategories();
        const mapped = (manufacturerRes || []).map((manu) => ({
          id: manu.id,
          name: manu.name,
          url: manu.manu_url,
          supportUrl: manu.support_url,
          phone: manu.support_phone,
          email: manu.support_email,
          notes: manu.notes,
          logo: manu.logo,
        }));
        const sorted = mapped.sort((a, b) => a.name.localeCompare(b.name));
        setManufacturers(sorted);
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
    setCheckedItems(allChecked ? [] : manufacturers.map((item) => item.id));
  };

  const toggleItem = (id) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const fetchManufacturers = async () => {
    setLoading(true);
    try {
      const res = await fetchAllCategories();
      const mapped = (res || []).map((manu) => ({
        id: manu.id,
        name: manu.name,
        url: manu.manu_url,
        supportUrl: manu.support_url,
        phone: manu.support_phone,
        email: manu.support_email,
        notes: manu.notes,
        logo: manu.logo,
      }));
      setManufacturers(mapped);
    } catch (e) {
      console.error("Error refreshing manufacturers:", e);
    } finally {
      setLoading(false);
    }
  };

  */

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

    return (timeoutId = setTimeout(() => {
      if (action === "create") {
        setAddRecordSuccess(false);
      } else {
        setUpdateRecordSuccess(false);
      }
    }, 5000));
  };

  const getAction = () => {
    if (addedManufacturer == true) {
      return "create";
    }

    if (updatedManufacturer == true) {
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
    if (deleteTarget) {
      console.log("Deleting single manufacturer id:", deleteTarget);
      setSuccessMessage("Manufacturer deleted successfully!");
    } else {
      console.log("Deleting multiple manufacturer ids:", checkedItems);
      if (checkedItems.length > 0) {
        setSuccessMessage("Manufacturers deleted successfully!");
      }
      setCheckedItems([]);
    }
    setTimeout(() => setSuccessMessage(""), 5000);
    closeDeleteModal();
  };

  const handleExport = () => {
    const dataToExport = searchedData.length > 0 ? searchedData : filteredData;
    exportToExcel(dataToExport, "Manufacturer_Records.xlsx");
  };

  // Set the setAddRecordSuccess or setUpdateRecordSuccess state to true when trigger, then reset to false after 5 seconds.
  useEffect(() => {
    let timeoutId;

    timeoutId = actionStatus(getAction(), true);

    // cleanup the timeout on unmount or when addedManufacturer or updatedManufacturer changes
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [addedManufacturer, updatedManufacturer, navigate, location.pathname]);

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}

      {isAddRecordSuccess && (
        <Alert message="Manufacturer added successfully!" type="success" />
      )}

      {isUpdateRecordSuccess && (
        <Alert message="Manufacturer updated successfully!" type="success" />
      )}

      {isDeleteModalOpen && (
        <DeleteModal
          endPoint={endPoint}
          closeModal={closeDeleteModal}
          actionType={"delete"}
          onConfirm={confirmDelete}
          /* BACKEND INTEGRATION HERE
          confirmDelete={async () => {
            await fetchManufacturers();
            setSuccessMessage("Manufacturer Deleted Successfully!");
            setTimeout(() => setSuccessMessage(""), 5000);
          }}
          onDeleteFail={() => {
            setErrorMessage("Delete failed. Please try again.");
            setTimeout(() => setErrorMessage(""), 5000);
          }}
            */
        />
      )}

      <ManufacturerFilterModal
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
              <h2 className="h2">Manufacturers ({searchedData.length})</h2>
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
                <MediumButtons type="export" onClick={handleExport} />
                <MediumButtons
                  type="new"
                  navigatePage="/More/ManufacturerRegistration"
                />
              </section>
            </section>

            {/* Table Structure */}
            <section className="manufacturer-page-table-section">
              <table>
                <thead>
                  <TableHeader
                    allChecked={allChecked}
                    onHeaderChange={handleHeaderChange}
                  />
                </thead>
                <tbody>
                  {paginatedManufacturer.length > 0 ? (
                    paginatedManufacturer.map((manufacturer, index) => (
                      <TableItem
                        key={index}
                        manufacturer={manufacturer}
                        isChecked={checkedItems.includes(manufacturer.id)}
                        onRowChange={handleRowChange}
                        onDeleteClick={() => {
                          /* BACKEND INTEGRATION HERE
                          setEndPoint(
                            `${contextServiceUrl}/contexts/manufacturers/${manufacturer.id}/delete/`
                          ); */
                          openDeleteModal(manufacturer.id);
                        }}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="no-data-message">
                        No manufacturer found.
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
