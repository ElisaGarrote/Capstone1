import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "../../services/auth-service";
import NavBar from "../../components/NavBar";
import MediumButtons from "../../components/buttons/MediumButtons";
import Pagination from "../../components/Pagination";
import ActionButtons from "../../components/ActionButtons";
import ConfirmationModal from "../../components/Modals/DeleteModal";
import ProductFilterModal from "../../components/Modals/ProductFilterModal";
import Alert from "../../components/Alert";
import Footer from "../../components/Footer";
import DefaultImage from "../../assets/img/default-image.jpg";
import ProductsMockupData from "../../data/mockData/products/products-mockup-data.json";
import ManufacturersMockupData from "../../data/mockData/products/manufacturers-mockup-data.json";

import "../../styles/Products/Products.css";
import "../../styles/ProductFilterModal.css";

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
      <th>MODEL NUMBER</th>
      <th>END OF LIFE</th>
      <th>MANUFACTURER</th>
      <th>DEPRECIATION</th>
      <th>DEFAULT COST</th>
      <th>DEFAULT SUPPLIER</th>
      <th>MINIMUM QUANTITY</th>
      <th>ACTION</th>
    </tr>
  );
}

// TableItem component to render each product row
function TableItem({ product, manufacturer, isSelected, onRowChange, onDeleteClick, onViewClick }) {
  const baseImage = product.image
    ? `https://assets-service-production.up.railway.app${product.image}`
    : DefaultImage;

  return (
    <tr>
      <td>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onRowChange(product.id, e.target.checked)}
        />
      </td>
      <td>
        <img
          src={baseImage}
          alt={product.name}
          className="table-img"
          onError={(e) => {
            e.target.src = DefaultImage;
          }}
        />
      </td>
      <td>{product.name}</td>
      <td>{product.category}</td>
      <td>{product.model || 'N/A'}</td>
      <td>{product.end_of_life || 'N/A'}</td>
      <td>{manufacturer}</td>
      <td>{product.depreciation}</td>
      <td>{product.purchase_cost ? `₱${product.purchase_cost.toLocaleString()}` : 'N/A'}</td>
      <td>{product.default_supplier || 'N/A'}</td>
      <td>{product.minimum_quantity || 'N/A'}</td>
      <td>
        <ActionButtons
          showEdit
          showDelete
          showView
          editPath={`/products/registration/${product.id}`}
          editState={{ product }}
          onDeleteClick={() => onDeleteClick(product.id)}
          onViewClick={() => onViewClick(product)}
        />
      </td>
    </tr>
  );
}

export default function Products() {
  const location = useLocation();
  const navigate = useNavigate();
  const [products] = useState(ProductsMockupData);
  const [manufacturers] = useState(ManufacturersMockupData);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [exportToggle, setExportToggle] = useState(false);
  const exportRef = useRef(null);
  const toggleRef = useRef(null);

  // Filter state
  const [filteredData, setFilteredData] = useState(ProductsMockupData);
  const [appliedFilters, setAppliedFilters] = useState({});

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // default page size or number of items per page

  // selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // paginate the data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = filteredData.slice(startIndex, endIndex);

  // selection logic
  const allSelected =
    paginatedProducts.length > 0 &&
    paginatedProducts.every((item) => selectedIds.includes(item.id));

  const handleHeaderChange = (e) => {
    if (e.target.checked) {
      setSelectedIds((prev) => [
        ...prev,
        ...paginatedProducts.map((item) => item.id).filter((id) => !prev.includes(id)),
      ]);
    } else {
      setSelectedIds((prev) =>
        prev.filter((id) => !paginatedProducts.map((item) => item.id).includes(id))
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

  // Add view handler
  const handleViewClick = (product) => {
    navigate(`/products/view/${product.id}`);
  };

  useEffect(() => {
    // Using mockup data - no need to fetch from API
    // Uncomment below to use real API data
    /*
    const fetchData = async () => {
      try {
        const [productRes, manufacturerRes] = await Promise.all([
          assetsService.fetchAllProducts(),
          fetchAllCategories(),
        ]);
        setProducts(productRes.products || []);
        setManufacturers(manufacturerRes.manufacturers || []);
      } catch (error) {
        console.error("Fetch error:", error);
        setErrorMessage("Failed to load data.");
      }
    };
    fetchData();
    */

    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setTimeout(() => {
        setSuccessMessage("");
        window.history.replaceState({}, document.title);
      }, 5000);
    }
  }, [location]);

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

  const getManufacturerName = (id) => {
    const found = manufacturers.find((m) => m.id === id);
    return found ? found.name : "-";
  };

  // Apply filters to data
  const applyFilters = (filters) => {
    let filtered = [...products];

    // Filter by Asset ID
    if (filters.assetId && filters.assetId.toString().trim() !== "") {
      filtered = filtered.filter((product) =>
        product.id.toString().includes(filters.assetId.toString())
      );
    }

    // Filter by Asset Model
    if (filters.assetModel && filters.assetModel.trim() !== "") {
      filtered = filtered.filter((product) =>
        product.name?.toLowerCase().includes(filters.assetModel.toLowerCase())
      );
    }

    // Filter by Status
    if (filters.status) {
      filtered = filtered.filter((product) =>
        product.status?.toLowerCase() === filters.status.value?.toLowerCase()
      );
    }

    // Filter by Supplier
    if (filters.supplier) {
      filtered = filtered.filter((product) =>
        product.default_supplier?.toLowerCase().includes(filters.supplier.label?.toLowerCase())
      );
    }

    // Filter by Location
    if (filters.location) {
      filtered = filtered.filter((product) =>
        product.location?.toLowerCase().includes(filters.location.label?.toLowerCase())
      );
    }

    // Filter by Asset Name
    if (filters.assetName && filters.assetName.trim() !== "") {
      filtered = filtered.filter((product) =>
        product.name?.toLowerCase().includes(filters.assetName.toLowerCase())
      );
    }

    // Filter by Serial Number
    if (filters.serialNumber && filters.serialNumber.toString().trim() !== "") {
      filtered = filtered.filter((product) =>
        product.serial_number?.toString().includes(filters.serialNumber.toString())
      );
    }

    // Filter by Warranty Expiration
    if (filters.warrantyExpiration && filters.warrantyExpiration.trim() !== "") {
      filtered = filtered.filter((product) =>
        product.warranty_expiration_date === filters.warrantyExpiration
      );
    }

    // Filter by Order Number
    if (filters.orderNumber && filters.orderNumber.toString().trim() !== "") {
      filtered = filtered.filter((product) =>
        product.order_number?.toString().includes(filters.orderNumber.toString())
      );
    }

    // Filter by Purchase Date
    if (filters.purchaseDate && filters.purchaseDate.trim() !== "") {
      filtered = filtered.filter((product) =>
        product.purchase_date === filters.purchaseDate
      );
    }

    // Filter by Purchase Cost
    if (filters.purchaseCost && filters.purchaseCost.toString().trim() !== "") {
      const cost = parseFloat(filters.purchaseCost);
      filtered = filtered.filter((product) =>
        product.purchase_cost === cost
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

      {/* Product Filter Modal */}
      <ProductFilterModal
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
              <h2 className="h2">Asset Models ({filteredData.length})</h2>
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
                {authService.getUserInfo().role === "Admin" && (
                  <MediumButtons
                    type="new"
                    navigatePage="/products/registration"
                  />
                )}
              </section>
            </section>

            {/* Table Structure */}
            <section className="products-table-section">
              {exportToggle && (
                <section className="export-button-section" ref={exportRef}>
                  <button>Download as Excel</button>
                  <button>Download as PDF</button>
                  <button>Download as CSV</button>
                </section>
              )}
              <table>
                <thead>
                  <TableHeader
                    allSelected={allSelected}
                    onHeaderChange={handleHeaderChange}
                  />
                </thead>
                <tbody>
                  {paginatedProducts.length > 0 ? (
                    paginatedProducts.map((product) => (
                      <TableItem
                        key={product.id}
                        product={product}
                        manufacturer={getManufacturerName(
                          product.manufacturer_id
                        )}
                        isSelected={selectedIds.includes(product.id)}
                        onRowChange={handleRowChange}
                        onDeleteClick={openDeleteModal}
                        onViewClick={handleViewClick}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={12} className="no-data-message">
                        No Asset Models Found.
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
