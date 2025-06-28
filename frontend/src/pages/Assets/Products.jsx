import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../../styles/custom-colors.css";
import "../../styles/Products.css";
import "../../styles/StandardizedButtons.css";
import NavBar from "../../components/NavBar";
import TableBtn from "../../components/buttons/TableButtons";
import DefaultImage from "../../assets/img/default-image.jpg";
import MediumButtons from "../../components/buttons/MediumButtons";
import DeleteModal from "../../components/Modals/DeleteModal";
import Alert from "../../components/Alert";
import assetsService from "../../services/assets-service";
import contextsService from "../../services/contexts-service";
import { SkeletonLoadingTable } from "../../components/Loading/LoadingSkeleton";
import ProductViewModal from "../../components/Modals/ProductViewModal";
import Pagination from "../../components/Pagination";
import usePagination from "../../hooks/usePagination";
import authService from "../../services/auth-service";

export default function Products() {
  const location = useLocation();
  const [isLoading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);
  const [endPoint, setEndPoint] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const allChecked = checkedItems.length === products.length;

  // Filter products based on search query
  const filteredProducts = products.filter(product => {
    return product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
           getManufacturerName(product.manufacturer_id).toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Pagination logic
  const {
    currentPage,
    itemsPerPage,
    paginatedData,
    totalItems,
    handlePageChange,
    handleItemsPerPageChange
  } = usePagination(filteredProducts, 20);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
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

  const getManufacturerName = (id) => {
    const found = manufacturers.find((m) => m.id === id);
    return found ? found.name : "-";
  };

  const toggleSelectAll = () => {
    setCheckedItems(allChecked ? [] : products.map((item) => item.id));
  };

  const toggleItem = (id) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await assetsService.fetchAllProducts();
      setProducts(res.products || []);
    } catch (e) {
      console.error("Error refreshing products:", e);
    } finally {
      setLoading(false);
    }
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

      <main className="products-page">
        <div className="container">
          {isLoading ? (
            <SkeletonLoadingTable />
          ) : (
            <>
              <section className="top">
                <h1>Products</h1>
                <div>
                  <form>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </form>
                  <MediumButtons type="export" />

                  {authService.getUserInfo().role === "Admin" && (
                    <MediumButtons
                      type="new"
                      navigatePage="/products/registration"
                    />
                  )}
                </div>
              </section>

              <section className="middle">
                <div className="table-wrapper">
                  <table>
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={allChecked}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th>IMAGE</th>
                      <th>NAME</th>
                      <th>CATEGORY</th>
                      <th>MANUFACTURER</th>
                      <th>DEPRECIATION</th>
                      <th>END OF LIFE</th>
                      {authService.getUserInfo().role === "Admin" && (
                        <>
                          <th>EDIT</th>
                          <th>DELETE</th>
                        </>
                      )}
                      <th>VIEW</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan="11" className="no-products-message">
                          <p>No products found. Please add some products.</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((product) => (
                        <tr key={product.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={checkedItems.includes(product.id)}
                              onChange={() => toggleItem(product.id)}
                            />
                          </td>
                          <td>
                            <img
                              src={
                                product.image
                                  ? `https://assets-service-production.up.railway.app${product.image}`
                                  : DefaultImage
                              }
                              alt={`Product-${product.name}`}
                              className="table-img"
                              onError={(e) => {
                                e.target.src = DefaultImage;
                              }}
                            />
                          </td>
                          <td>{product.name}</td>
                          <td>{product.category}</td>
                          <td>
                            {getManufacturerName(product.manufacturer_id)}
                          </td>
                          <td>{product.depreciation}</td>
                          <td>{product.end_of_life}</td>
                          {authService.getUserInfo().role === "Admin" && (
                            <>
                              <td>
                                <TableBtn
                                  type="edit"
                                  navigatePage={`/products/registration/${product.id}`}
                                  data={product.id}
                                />
                              </td>
                              <td>
                                <TableBtn
                                  type="delete"
                                  showModal={() => {
                                    setEndPoint(
                                      `https://assets-service-production.up.railway.app/products/${product.id}/delete/`
                                    );
                                    setDeleteModalOpen(true);
                                  }}
                                  data={product.id}
                                />
                              </td>
                            </>
                          )}
                          <td>
                            <TableBtn
                              type="view"
                              onClick={() => handleView(product.id)}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                </div>
              </section>

              {/* Pagination */}
              {filteredProducts.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  itemsPerPageOptions={[10, 20, 50, 100]}
                />
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
