import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/custom-colors.css";
import "../../styles/Products/Products.css";
import NavBar from "../../components/NavBar";
import TableBtn from "../../components/buttons/TableButtons";
import DefaultImage from "../../assets/img/default-image.jpg";
import MediumButtons from "../../components/buttons/MediumButtons";
import DeleteModal from "../../components/Modals/DeleteModal";
import Alert from "../../components/Alert";
import ProductViewModal from "../../components/Modals/ProductViewModal";
import Pagination from "../../components/Pagination";
import DepreciationFilter from "../../components/FilterPanel";
import authService from "../../services/auth-service";
import ProductsMockupData from "../../data/mockData/products/products-mockup-data.json";
import ManufacturersMockupData from "../../data/mockData/products/manufacturers-mockup-data.json";

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

// TableHeader component to render the table header
function TableHeader() {
  return (
    <tr>
      <th>IMAGE</th>
      <th>NAME</th>
      <th>CATEGORY</th>
      <th>MANUFACTURER</th>
      <th>DEPRECIATION</th>
      <th>END OF LIFE</th>
      <th>ACTIONS</th>
    </tr>
  );
}

// TableItem component to render each product row
function TableItem({ product, manufacturer, onView, onEdit, onDelete }) {
  const baseImage = product.image
    ? `https://assets-service-production.up.railway.app${product.image}`
    : DefaultImage;

  return (
    <tr>
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
        <div className="action-buttons">
          <TableBtn type="view" onClick={() => onView(product.id)} />
          <TableBtn type="edit" onClick={() => onEdit(product.id)} />
          <TableBtn type="delete" onClick={() => onDelete(product)} />
        </div>
      </td>
    </tr>
  );
}

export default function Products() {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState(ProductsMockupData);
  const [manufacturers, setManufacturers] = useState(ManufacturersMockupData);
  const [endPoint, setEndPoint] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [exportToggle, setExportToggle] = useState(false);
  const exportRef = useRef(null);
  const toggleRef = useRef(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Paginate the data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = products.slice(startIndex, endIndex);

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

  const fetchProducts = async () => {
    // Using mockup data - just reset to original mockup data
    setProducts(ProductsMockupData);

    // Uncomment below to use real API data
    /*
    try {
      const res = await assetsService.fetchAllProducts();
      setProducts(res.products || []);
    } catch (e) {
      console.error("Error refreshing products:", e);
    }
    */
  };

  const handleView = async (productId) => {
    console.log("product id:", productId);
    try {
      setLoading(true);
      setErrorMessage("");

      // Fetch the main product
      const productData = await assetsService.fetchProductById(productId);
      console.log("Product data:", productData);

      if (!productData) {
        setErrorMessage("Product details not found.");
        setLoading(false);
        return;
      }

      let manufacturerName = productData.manufacturer || "-";
      let supplierName = productData.supplier || "-";

      // Only try fetch if we have IDs
      if (productData.manufacturer_id) {
        try {
          const manufacturerResponse = await contextsService.fetchManufacturerById(productData.manufacturer_id);
          console.log("Manufacturer response:", manufacturerResponse);
          manufacturerName = manufacturerResponse?.name || manufacturerName;
        } catch (err) {
          console.warn("Manufacturer fetch failed:", err);
        }
      }

      if (productData.default_supplier_id) {
        try {
          const supplierResponse = await contextsService.fetchSuppNameById(productData.default_supplier_id);
          console.log("Supplier response:", supplierResponse);
          supplierName = supplierResponse?.name || supplierName;
        } catch (err) {
          console.warn("Supplier fetch failed:", err);
        }
      }

      // Compose full view
      const manuFullView = {
        ...productData,
        manufacturer: manufacturerName,
        supplier: supplierName,
      };

      console.log("Prepared product view:", manuFullView);
      setSelectedProduct(manuFullView);
      setViewModalOpen(true);
    } catch (error) {
      console.error("Error fetching product details:", error);
      setErrorMessage("Failed to load product details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {successMessage && <Alert message={successMessage} type="success" />}

      {isDeleteModalOpen && (
        <DeleteModal
          endPoint={endPoint}
          closeModal={() => setDeleteModalOpen(false)}
          confirmDelete={async () => {
            await fetchProducts();
            setSuccessMessage("Product Deleted Successfully!");
            setTimeout(() => setSuccessMessage(""), 5000);
          }}
          onDeleteFail={() => {
            setErrorMessage("Delete failed. Please try again.");
            setTimeout(() => setErrorMessage(""), 5000);
          }}
        />
      )}

      {isViewModalOpen && selectedProduct && (
        <ProductViewModal
          product={selectedProduct}
          closeModal={() => setViewModalOpen(false)}
        />
      )}

      <nav>
        <NavBar />
      </nav>

      <main className="page-layout">
        {/* Title of the Page */}
        <section className="title-page-section">
          <h1>Products</h1>
          {authService.getUserInfo().role === "Admin" && (
            <MediumButtons
              type="new"
              navigatePage="/products/registration"
            />
          )}
        </section>

        {/* Table Filter */}
        <DepreciationFilter filters={filterConfig} />

        <section className="table-layout">
          {/* Table Header */}
          <section className="table-header">
            <h2 className="h2">Products ({products.length})</h2>
            <section className="table-actions">
              <input
                type="search"
                placeholder="Search..."
                className="search"
              />
              <div ref={toggleRef}>
                <MediumButtons
                  type="export"
                  onClick={() => setExportToggle(!exportToggle)}
                />
              </div>
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
                <TableHeader />
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
                      onView={handleView}
                      onEdit={(id) =>
                        navigate(`/products/registration/${id}`)
                      }
                      onDelete={(product) => {
                        setEndPoint(
                          `https://assets-service-production.up.railway.app/products/${product.id}/delete/`
                        );
                        setDeleteModalOpen(true);
                      }}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="no-data-message">
                      No products found.
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
              totalItems={products.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </section>
        </section>
      </main>
    </>
  );
}
