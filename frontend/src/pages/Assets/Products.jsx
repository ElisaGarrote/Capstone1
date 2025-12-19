import { useEffect, useMemo, useState } from "react";
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
import AssetsMockupData from "../../data/mockData/assets/assets-mockup-data.json";
import { exportToExcel } from "../../utils/exportToExcel";

import "../../styles/Products/Products.css";
import "../../styles/ProductFilterModal.css";

// TableHeader component to render the table header
function TableHeader({ allSelected, onHeaderChange }) {
  const navigate = useNavigate();

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
      <th>
        <a
          className="category-link"
          role="button"
          onClick={() => navigate("/More/ViewCategories")}
        >
          CATEGORY
        </a>
      </th>
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
  const navigate = useNavigate();
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
      <td>
        <a
          className="category-link"
          onClick={() => navigate("/More/ViewCategories", { state: { selectedCategory: product.category } })}
          role="button"
        >
          {product.category}
        </a>
      </td>
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

  // Filter state
  const [filteredData, setFilteredData] = useState(ProductsMockupData);
  const [appliedFilters, setAppliedFilters] = useState({});

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

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


  const getManufacturerName = (id) => {
    const found = manufacturers.find((m) => m.id === id);
    return found ? found.name : "-";
  };

  // Apply filters to data
  const productsInUseSet = useMemo(
    () => new Set(AssetsMockupData.map((asset) => asset.name)),
    []
  );

  const isProductArchived = (product) => {
    if (!product.end_of_life) return false;
    const today = new Date().toISOString().split("T")[0];
    return product.end_of_life < today;
  };

  const applyFilters = (filters) => {
    let filtered = [...products];

    // Filter by Category
    if (filters.category && filters.category.trim() !== "") {
      filtered = filtered.filter(
        (product) =>
          product.category &&
          product.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Filter by Manufacturer
    if (filters.manufacturer && filters.manufacturer.toString().trim() !== "") {
      filtered = filtered.filter(
        (product) =>
          product.manufacturer_id?.toString() === filters.manufacturer.toString()
      );
    }

    // Filter by Depreciation
    if (filters.depreciation && filters.depreciation.trim() !== ""
    ) {
      filtered = filtered.filter(
        (product) =>
          product.depreciation &&
          product.depreciation.toLowerCase() === filters.depreciation.toLowerCase()
      );
    }

    // Filter by Archived flag
    if (filters.archived === "yes") {
      filtered = filtered.filter((product) => isProductArchived(product));
    } else if (filters.archived === "no") {
      filtered = filtered.filter((product) => !isProductArchived(product));
    }

    // Filter by In used by Asset flag
    if (filters.inUseByAsset === "yes") {
      filtered = filtered.filter((product) => productsInUseSet.has(product.name));
    } else if (filters.inUseByAsset === "no") {
      filtered = filtered.filter((product) => !productsInUseSet.has(product.name));
    }

    // Filter by Created At range
    if (filters.createdAtFrom || filters.createdAtTo) {
      const from = filters.createdAtFrom ? new Date(filters.createdAtFrom) : null;
      const to = filters.createdAtTo ? new Date(filters.createdAtTo) : null;

      filtered = filtered.filter((product) => {
        if (!product.created_at) return false;
        const created = new Date(product.created_at);
        if (Number.isNaN(created)) return false;
        if (from && created < from) return false;
        if (to && created > to) return false;
        return true;
      });
    }

    // Filter by Updated At range
    if (filters.updatedAtFrom || filters.updatedAtTo) {
      const from = filters.updatedAtFrom ? new Date(filters.updatedAtFrom) : null;
      const to = filters.updatedAtTo ? new Date(filters.updatedAtTo) : null;

      filtered = filtered.filter((product) => {
        if (!product.updated_at) return false;
        const updated = new Date(product.updated_at);
        if (Number.isNaN(updated)) return false;
        if (from && updated < from) return false;
        if (to && updated > to) return false;
        return true;
      });
    }

    // Filter by Connectivity
    if (filters.connectivity && filters.connectivity.trim() !== "") {
      filtered = filtered.filter(
        (product) =>
          product.connectivity &&
          product.connectivity.toLowerCase() === filters.connectivity.toLowerCase()
      );
    }

    // Filter by CPU
    if (filters.cpu && filters.cpu.trim() !== "") {
      filtered = filtered.filter(
        (product) =>
          product.cpu && product.cpu.toLowerCase() === filters.cpu.toLowerCase()
      );
    }

    // Filter by GPU
    if (filters.gpu && filters.gpu.trim() !== "") {
      filtered = filtered.filter(
        (product) =>
          product.gpu && product.gpu.toLowerCase() === filters.gpu.toLowerCase()
      );
    }

    // Filter by RAM
    if (filters.ram && filters.ram.trim() !== "") {
      filtered = filtered.filter(
        (product) =>
          product.ram && product.ram.toLowerCase() === filters.ram.toLowerCase()
      );
    }

    // Filter by Operating System
    if (filters.operatingSystem && filters.operatingSystem.trim() !== "") {
      filtered = filtered.filter(
        (product) =>
          product.operating_system &&
          product.operating_system.toLowerCase() === filters.operatingSystem.toLowerCase()
      );
    }

    // Filter by Screen Size
    if (filters.screenSize && filters.screenSize.trim() !== "") {
      filtered = filtered.filter(
        (product) =>
          product.screen_size &&
          product.screen_size.toLowerCase() === filters.screenSize.toLowerCase()
      );
    }

    // Filter by Storage Size
    if (filters.storageSize && filters.storageSize.trim() !== "") {
      filtered = filtered.filter(
        (product) =>
          product.storage_size &&
          product.storage_size.toLowerCase() === filters.storageSize.toLowerCase()
      );
    }

    return filtered;
  };

  // Combine modal filters and search term
  const applyFiltersAndSearch = (filters, term) => {
    let filtered = applyFilters(filters || {});

    if (term && term.trim() !== "") {
      const lowerTerm = term.toLowerCase();
      filtered = filtered.filter((product) =>
        (product.name && product.name.toLowerCase().includes(lowerTerm)) ||
        (product.category && product.category.toLowerCase().includes(lowerTerm)) ||
        (product.model && product.model.toLowerCase().includes(lowerTerm)) ||
        (product.default_supplier && product.default_supplier.toLowerCase().includes(lowerTerm))
      );
    }

    return filtered;
  };

  // Handle filter apply
  const handleApplyFilter = (filters) => {
    setAppliedFilters(filters);
    const filtered = applyFiltersAndSearch(filters, searchTerm);
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle search input
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setCurrentPage(1);
    const filtered = applyFiltersAndSearch(appliedFilters, term);
    setFilteredData(filtered);
  };

  const handleExport = () => {
    const dataToExport = filteredData.length > 0 ? filteredData : products;
    exportToExcel(dataToExport, "AssetModels_Records.xlsx");
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
                {/* Bulk edit and delete buttons only when checkboxes selected */}
                {selectedIds.length > 0 && (
                  <>
                    <MediumButtons
                      type="edit"
                      onClick={() =>
                        navigate("/products/bulk-edit", { state: { selectedIds } })
                      }
                    />
                    <MediumButtons
                      type="delete"
                      onClick={() => openDeleteModal(null)}
                    />
                  </>
                )}
                <input
                  type="search"
                  placeholder="Search..."
                  className="search"
                  value={searchTerm}
                  onChange={handleSearch}
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
                  type="export"
                  onClick={handleExport}
                />
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
