import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "../../services/auth-service";
import NavBar from "../../components/NavBar";
import MediumButtons from "../../components/buttons/MediumButtons";
import FilterPanel from "../../components/FilterPanel";
import Pagination from "../../components/Pagination";
import ActionButtons from "../../components/ActionButtons";
import ConfirmationModal from "../../components/Modals/DeleteModal";
import Alert from "../../components/Alert";
import DefaultImage from "../../assets/img/default-image.jpg";
import ProductsMockupData from "../../data/mockData/products/products-mockup-data.json";
import ManufacturersMockupData from "../../data/mockData/products/manufacturers-mockup-data.json";

import "../../styles/Products/Products.css";

// Filter configuration for products
const filterConfig = [
  {
    type: "select",
    name: "category",
    label: "Category",
    options: [
      { value: "laptop", label: "Laptop" },
      { value: "desktop", label: "Desktop" },
      { value: "mobile", label: "Mobile Phone" },
      { value: "tablet", label: "Tablet" },
      { value: "accessory", label: "Accessory" },
    ],
  },
  {
    type: "text",
    name: "manufacturer",
    label: "Manufacturer",
  },
];

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
      <th>IMAGE</th>
      <th>NAME</th>
      <th>CATEGORY</th>
      <th>MANUFACTURER</th>
      <th>DEPRECIATION</th>
      <th>END OF LIFE</th>
      <th>ACTION</th>
    </tr>
  );
}

// TableItem
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
      <td>{manufacturer}</td>
      <td>{product.depreciation}</td>
      <td>{product.end_of_life}</td>
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
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [exportToggle, setExportToggle] = useState(false);
  const exportRef = useRef(null);
  const toggleRef = useRef(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Paginate the data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = products.slice(startIndex, endIndex);

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
          contextsService.fetchAllManufacturerNames(),
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



      <section>
        <nav>
          <NavBar />
        </nav>

        <main className="page-layout products-page">
          <section className="title-page-section">
            <h1>Products</h1>
          </section>

          <FilterPanel filters={filterConfig} />

          <section className="table-layout">
            <section className="table-header">
              <h2 className="h2">Products ({products.length})</h2>
              <section className="table-actions">
                {/* Bulk delete button only when checkboxes selected */}
                {selectedIds.length > 0 && (
                  <MediumButtons
                    type="delete"
                    onClick={() => openDeleteModal(null)}
                  />
                )}
                <input type="search" placeholder="Search..." className="search" />
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
                      <td colSpan={8} className="no-data-message">
                        No Products Found.
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
                totalItems={products.length}
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
