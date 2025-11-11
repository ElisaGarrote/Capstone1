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
import MockupData from "../../data/mockData/more/supplier-mockup-data.json";
import { fetchAllCategories } from "../../services/contexts-service";
import { exportToExcel } from "../../utils/exportToExcel";

import "../../styles/ViewSupplier.css";

// TableHeader component to render the table header
function TableHeader() {
  return (
    <tr>
      <th>
        <input
          type="checkbox"
          name="checkbox-supplier"
          id="checkbox-supplier"
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
      <th>URL</th>
      <th>ACTIONS</th>
    </tr>
  );
}

// TableItem component to render each ticket row
function TableItem({ supplier, onDeleteClick }) {
  const navigate = useNavigate();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <tr>
      <td>
        <div className="checkbox-supplier">
          <input type="checkbox" name="" id="" />
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
      <td>{supplier.url || "-"}</td>
      <td>
        <section className="action-button-section">
          <button
            title="View"
            className="action-button"
            onClick={() =>
              navigate(`/More/SupplierDetails/${supplier.id}`, {
                state: { supplier },
              })
            }
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

  const allChecked = checkedItems.length === suppliers.length;
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");

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
      filtered = filtered.filter((supplier) =>
        supplier.name?.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    // Filter by Country
    if (filters.country && filters.country.trim() !== "") {
      filtered = filtered.filter((supplier) =>
        supplier.country?.toLowerCase().includes(filters.country.toLowerCase())
      );
    }

    // Filter by City
    if (filters.city && filters.city.trim() !== "") {
      filtered = filtered.filter((supplier) =>
        supplier.city?.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    // Filter by Email
    if (filters.email && filters.email.trim() !== "") {
      filtered = filtered.filter((supplier) =>
        supplier.email?.toLowerCase().includes(filters.email.toLowerCase())
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
  const paginatedSuppliers = filteredData.slice(startIndex, endIndex);

  // Retrieve the "addManufacturer" value passed from the navigation state.
  // If the "addManufacturer" is not exist, the default value for this is "undifiend".
  const addedSupplier = location.state?.addedSupplier;
  const updatedSupplier = location.state?.updatedSupplier;

  /* BACKEND INTEGRATION HERE
  const contextServiceUrl =
    "https://contexts-service-production.up.railway.app";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const suppRes = await fetchAllCategories();
        const mapped = (suppRes || []).map((supp) => ({
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
          logo: supp.logo,
        }));
        const sorted = mapped.sort((a, b) => a.name.localeCompare(b.name));
        setSuppliers(sorted);
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
      const res = await contextsService.fetchAllSuppliers();
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
  */

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    if (addedSupplier == true) {
      return "create";
    }

    if (updatedSupplier == true) {
      return "update";
    }

    return null;
  };

  const handleExport = () => {
    const dataToExport = suppliers.length > 0 ? suppliers : MockupData;
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
          closeModal={() => setDeleteModalOpen(false)}
          actionType="delete"
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
              <h2 className="h2">Suppliers ({filteredData.length})</h2>
              <section className="table-actions">
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
                  <TableHeader />
                </thead>
                <tbody>
                  {paginatedSuppliers.length > 0 ? (
                    paginatedSuppliers.map((supplier, index) => (
                      <TableItem
                        key={index}
                        supplier={supplier}
                        onDeleteClick={() => {
                          /* BACKEND INTEGRATION HERE
                          setEndPoint(
                            `${contextServiceUrl}/contexts/suppliers/${supplier.id}/delete/`
                          ); */
                          setDeleteModalOpen(true);
                        }}
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
