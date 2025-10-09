import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SkeletonLoadingTable } from "../../components/Loading/LoadingSkeleton";
import NavBar from "../../components/NavBar";
import DeleteModal from "../../components/Modals/DeleteModal";
import MediumButtons from "../../components/buttons/MediumButtons";
import Alert from "../../components/Alert";
import contextsService from "../../services/contexts-service";
import Pagination from "../../components/Pagination";
import SupplierFilter from "../../components/FilterPanel";
import Footer from "../../components/Footer";
import DefaultImage from "../../assets/img/default-image.jpg";

import "../../styles/ViewSupplier.css";

const filterConfig = [
  {
    type: "text",
    name: "supplierName",
    label: "Supplier Name",
  },
  {
    type: "select",
    name: "city",
    label: "City",
    options: [
      { value: "makati", label: "Makati" },
      { value: "marikina", label: "Marikina" },
      { value: "pasig", label: "Pasig" },
    ],
  },
  {
    type: "text",
    name: "contactPerson",
    label: "Contat Person",
  },
];

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
      <th>ZIP</th>
      <th>CONTACT PERSON</th>
      <th>PHONE</th>
      <th>EMAIL</th>
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
          <span
            onClick={() =>
              navigate(`/More/SupplierDetails/${supplier.id}`, {
                state: { supplier },
              })
            }
          >
            {supplier.name}
          </span>
        </div>
      </td>
      <td>{supplier.address || "-"}</td>
      <td>{supplier.city || "-"}</td>
      <td>{supplier.zip || "-"}</td>
      <td>{supplier.contactName || "-"}</td>
      <td>{supplier.phoneNumber || "-"}</td>
      <td>{supplier.email || "-"}</td>
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
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const allChecked = checkedItems.length === suppliers.length;
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const contextServiceUrl =
    "https://contexts-service-production.up.railway.app";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const suppRes = await contextsService.fetchAllSuppliers();
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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // default page size or number of items per page

  // paginate the data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedSuppliers = filteredSuppliers.slice(startIndex, endIndex);

  // ----------------- Render -----------------
  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}

      {isDeleteModalOpen && (
        <DeleteModal
          endPoint={endPoint}
          closeModal={() => setDeleteModalOpen(false)}
          actionType="delete"
          confirmDelete={async () => {
            await fetchSuppliers();
            setSuccessMessage("Supplier Deleted Successfully!");
            setTimeout(() => setSuccessMessage(""), 5000);
          }}
          onDeleteFail={() => {
            setErrorMessage("Delete failed. Please try again.");
            setTimeout(() => setErrorMessage(""), 5000);
          }}
        />
      )}

      <section className="page-layout-with-table">
        <NavBar />

        <main className="main-with-table">
          {/* Table Filter */}
          <SupplierFilter filters={filterConfig} />

          <section className="table-layout">
            {/* Table Header */}
            <section className="table-header">
              <h2 className="h2">Suppliers ({filteredSuppliers.length})</h2>
              <section className="table-actions">
                <input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="search"
                />
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
                          setEndPoint(
                            `${contextServiceUrl}/contexts/suppliers/${supplier.id}/delete/`
                          );
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
                totalItems={filteredSuppliers.length}
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
