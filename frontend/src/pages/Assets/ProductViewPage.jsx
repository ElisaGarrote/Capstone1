import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import DetailedViewPage from "../../components/DetailedViewPage/DetailedViewPage";
import DefaultImage from "../../assets/img/default-image.jpg";
import ProductsMockupData from "../../data/mockData/products/products-mockup-data.json";
import ManufacturersMockupData from "../../data/mockData/products/manufacturers-mockup-data.json";
import "../../styles/Products/ProductViewPage.css";
import "../../styles/Assets/AssetViewPage.css";
import MediumButtons from "../../components/buttons/MediumButtons";
import ConfirmationModal from "../../components/Modals/DeleteModal";
import { getProductDetails, getProductTabs } from "../../data/mockData/products/productDetailsData";

function ProductViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [manufacturer, setManufacturer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

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

  const tabs = getProductTabs();

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const confirmDelete = () => {
    // Handle product deletion logic here
    console.log("Deleting product:", product.id);
    closeDeleteModal();
    navigate("/products");
  };

  // Button action handlers
  const handleCloneClick = () => {
    console.log('Clone button clicked, product:', product);
    if (product) {
      console.log('Navigating to registration with cloned name:', `${product.name} (cloned)`);
      navigate('/products/registration', {
        state: { clonedProductName: `${product.name} (cloned)` }
      });
    } else {
      console.log('No product found for cloning');
    }
  };

  const handleEditClick = () => {
    navigate(`/products/registration/${product.id}`);
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  // Create action buttons with vertical layout - Clone, Edit, Delete
  const actionButtons = (
    <div className="vertical-action-buttons">
      <button
        type="button"
        className="action-btn clone-btn"
        onClick={handleCloneClick}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="white"
          style={{ marginRight: '8px' }}
        >
          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
        </svg>
        Clone
      </button>
      <button
        type="button"
        className="action-btn edit-btn"
        onClick={handleEditClick}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="white"
          style={{ marginRight: '8px' }}
        >
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
        </svg>
        Edit
      </button>
      <MediumButtons
        type="delete"
        onClick={handleDeleteClick}
      />
    </div>
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
      <DetailedViewPage
        {...getProductDetails(product, manufacturer)}
        assetImage={imageSrc}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        actionButtons={actionButtons}
      >
        {/* Tab Content */}
        {activeTab === 0 && (
          // About Tab - No QR, Only Details Section
          <div className="about-section">
            <div className="asset-details-section">
              <h3 className="section-header">Asset Model Details</h3>
              <div className="asset-details-grid">
                <div className="detail-row">
                  <label>Product Name</label>
                  <span>{product.name || "N/A"}</span>
                </div>

                <div className="detail-row">
                  <label>Model Number</label>
                  <span>{product.model || "N/A"}</span>
                </div>

                <div className="detail-row">
                  <label>Category</label>
                  <span>{product.category || "N/A"}</span>
                </div>

                <div className="detail-row">
                  <label>Manufacturer</label>
                  <span>{manufacturer?.name || "N/A"}</span>
                </div>

                <div className="detail-row">
                  <label>Depreciation</label>
                  <span>{product.depreciation || "N/A"}</span>
                </div>

                <div className="detail-row">
                  <label>End of Life</label>
                  <span>{product.end_of_life || "N/A"}</span>
                </div>

                <div className="detail-row">
                  <label>Default Purchase Cost</label>
                  <span>{product.purchase_cost ? `PHP ${product.purchase_cost}` : "N/A"}</span>
                </div>

                <div className="detail-row">
                  <label>Minimum Quantity</label>
                  <span>{product.minimum_quantity || "N/A"}</span>
                </div>

                <div className="detail-row">
                  <label>CPU</label>
                  <span>{product.cpu || "N/A"}</span>
                </div>

                <div className="detail-row">
                  <label>GPU</label>
                  <span>{product.gpu || "N/A"}</span>
                </div>

                <div className="detail-row">
                  <label>Operating System</label>
                  <span>{product.operating_system || "N/A"}</span>
                </div>

                <div className="detail-row">
                  <label>RAM</label>
                  <span>{product.ram || "N/A"}</span>
                </div>

                <div className="detail-row">
                  <label>Screen Size</label>
                  <span>{product.screen_size || "N/A"}</span>
                </div>

                <div className="detail-row">
                  <label>Storage Size</label>
                  <span>{product.storage_size || "N/A"}</span>
                </div>

                <div className="detail-row">
                  <label>Notes</label>
                  <span>{product.description || "N/A"}</span>
                </div>

                <div className="detail-row">
                  <label>Created At</label>
                  <span>{product.created_at || "N/A"}</span>
                </div>

                <div className="detail-row">
                  <label>Updated At</label>
                  <span>{product.updated_at || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 1 && (
          // Products Tab
          <div className="products-tab-wrapper">
            <div className="products-table-section">
              <table className="products-table">
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
          </div>
        )}
      </DetailedViewPage>
    </>
  );
}

export default ProductViewPage;