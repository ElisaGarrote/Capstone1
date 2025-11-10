import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/NavBar";
import ViewPage from "../../components/View/Viewpage";
import DefaultImage from "../../assets/img/default-image.jpg";
import ProductsMockupData from "../../data/mockData/products/products-mockup-data.json";
import ManufacturersMockupData from "../../data/mockData/products/manufacturers-mockup-data.json";
import "../../styles/Products/ProductViewPage.css";
import MediumButtons from "../../components/buttons/MediumButtons";
import ConfirmationModal from "../../components/Modals/DeleteModal";

function ProductViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [manufacturer, setManufacturer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    // Find product from mockup data
    const foundProduct = ProductsMockupData.find((p) => p.id === parseInt(id));
    if (foundProduct) {
      setProduct(foundProduct);

      // Find manufacturer
      const foundManufacturer = ManufacturersMockupData.find(
        (m) => m.id === foundProduct.manufacturer_id
      );
      setManufacturer(foundManufacturer);
    }
    setIsLoading(false);
  }, [id]);

  if (isLoading) {
    return null; // Don't render anything while loading
  }

  if (!product) {
    return (
      <>
        <NavBar />
        <div style={{ padding: "40px", textAlign: "center" }}>
          <h2>Product not found</h2>
        </div>
      </>
    );
  }

  const imageSrc = product.image
    ? `https://assets-service-production.up.railway.app${product.image}`
    : DefaultImage;

  // Sidebar content
  const sidebarContent = (
    <>
      <div className="view-info-item">
        <label>Product:</label>
        <p>{product.name}</p>
      </div>
      <div className="view-info-item">
        <label>Category:</label>
        <p>{product.category}</p>
      </div>
      <div className="view-info-item">
        <label>Manufacturer:</label>
        <p>{manufacturer?.name || "-"}</p>
      </div>
      <div className="view-info-item">
        <label>Model:</label>
        <p>{product.model || "-"}</p>
      </div>
      <div className="view-info-item">
        <label>Purchase Cost:</label>
        <p>{product.purchase_cost ? `PHP ${product.purchase_cost}` : "-"}</p>
      </div>
      <div className="view-info-item">
        <label>Minimum Value:</label>
        <p>{product.minimum_value ? `PHP ${product.minimum_value}` : "-"}</p>
      </div>
      <div className="view-info-item">
        <label>Depreciation:</label>
        <p>{product.depreciation || "-"}</p>
      </div>
      <div className="view-info-item">
        <label>End of Life:</label>
        <p>{product.end_of_life || "-"}</p>
      </div>
      <div className="view-info-item">
        <label>Description:</label>
        <p>{product.description || "-"}</p>
      </div>
    </>
  );

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const confirmDelete = () => {
    // Handle product deletion logic here
    console.log("Deleting product:", product.id);
    closeDeleteModal();
    navigate("/products");
  };

  // Action buttons
  const actionButtons = (
    <>
      <button className="view-action-btn edit" onClick={() => navigate(`/products/registration/${product.id}`)}>
        Edit
      </button>
      <button
        className="view-action-btn delete"
        onClick={() => setDeleteModalOpen(true)}
      >
        Delete
      </button>
    </>
  );

  return (
    <>
      <NavBar />
      {isDeleteModalOpen && (
        <ConfirmationModal
          closeModal={closeDeleteModal}
          actionType="delete"
          onConfirm={confirmDelete}
        />
      )}
      <ViewPage
        breadcrumbRoot="Asset Models"
        breadcrumbCurrent="Show Asset Model"
        breadcrumbRootPath="/products"
        title={`${product.name}`}
        sidebarContent={sidebarContent}
        actionButtons={actionButtons}
      >
        {/* Main Content - Asset Model Table */}
        <div className="product-view-content">
          {/* Top Actions */}
          <div className="product-view-header">
            <div className="product-view-tabs">
              <span className="product-tab-text">Asset Models (1)</span>
            </div>
            <div className="product-view-actions">
              <input type="search" placeholder="Search..." className="product-search" />
            </div>
          </div>

          {/* Product Table */}
          <div className="product-view-table-wrapper">
            <table className="product-view-table">
              <thead>
                <tr>
                  <th>IMAGE</th>
                  <th>NAME</th>
                  <th>CATEGORY</th>
                  <th>MANUFACTURER</th>
                  <th>DEPRECIATION</th>
                  <th>END OF LIFE</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <img src={imageSrc} alt={product.name} className="product-thumbnail" onError={(e) => { e.target.src = DefaultImage; }} />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{manufacturer?.name || "-"}</td>
                  <td>{product.depreciation}</td>
                  <td>{product.end_of_life}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="product-view-pagination">
            Showing 1 to 1 of 1 entries
          </div>
        </div>
      </ViewPage>
    </>
  );
}

export default ProductViewPage;