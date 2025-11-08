import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import DetailedViewPage from "../../components/DetailedViewPage/DetailedViewPage";
import MockupData from "../../data/mockData/assets/assets-mockup-data.json";
import DefaultImage from "../../assets/img/default-image.jpg";
import MediumButtons from "../../components/buttons/MediumButtons";
import "../../styles/Assets/AssetViewPage.css";
import "../../styles/Assets/AssetEditPage.css";
import ConfirmationModal from "../../components/Modals/DeleteModal";

function AssetViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Find asset from mockup data
    const foundAsset = MockupData.find((a) => a.id === parseInt(id));
    if (foundAsset) {
      setAsset(foundAsset);
    }
  }, [id]);

  if (!asset) {
    return (
      <>
        <NavBar />
        <div style={{ padding: "40px", textAlign: "center" }}>
          <h2>Asset not found</h2>
        </div>
      </>
    );
  }

  // Define tabs for the detailed view
  const tabs = [
    { label: "About" },
    { label: "History" },
    { label: "Components ()" },
    { label: "Repair ()" },
    { label: "Audits ()" },
    { label: "Attachments ()" }
  ];

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const confirmDelete = () => {
    // Handle asset deletion logic here
    console.log("Deleting asset:", asset.id);
    closeDeleteModal();
    navigate("/assets");
  };

  // Checked out to information
  const checkedOutTo = asset.checkoutRecord ? {
    name: "Elias Gamboa",
    email: "garciamariaeliasgarcia@gmail.com",
    checkoutDate: "2025-08-15"
  } : null;

  // Button action handlers
  const handleCloneClick = () => {
    console.log('Clone button clicked, asset:', asset);
    if (asset) {
      console.log('Navigating to registration with cloned name:', `${asset.name} (cloned)`);
      navigate('/assets/registration', {
        state: { clonedAssetName: `${asset.name} (cloned)` }
      });
    } else {
      console.log('No asset found for cloning');
    }
  };

  const handleEditClick = () => {
    navigate(`/assets/edit/${asset.id}`);
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  // Create action buttons with vertical layout
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
        breadcrumbRoot="Assets"
        breadcrumbCurrent="Show Asset"
        breadcrumbRootPath="/assets"
        title={asset.name}
        subtitle={`Asset ID: ${asset.displayed_id}`}
        assetImage={asset.image ? `https://assets-service-production.up.railway.app${asset.image}` : DefaultImage}
        assetTag={asset.displayed_id}
        status="Ready to Deploy"
        statusType="ready-to-deploy"
        company="Zip Technology Corp."
        checkoutDate="2025-08-15 12:00 AM"
        nextAuditDate="2025-08-19"
        manufacturer="Apple"
        manufacturerUrl="https://www.apple.com"
        supportUrl="https://support.apple.com"
        supportPhone="+1 800 136 900"
        category="Mobile Phones"
        model={asset.name || "iPhone 16 Pro Max"}
        modelNo="2129GH3221"
        // About section props
        productName={asset.name || "iPhone 16 Pro Max"}
        serialNumber="SN123456789"
        assetType="Smartphone"
        supplier="Apple Authorized Reseller"
        depreciationType="Straight Line"
        fullyDepreciatedDate="2029-01-15 (4 years, 2 months, 2 weeks remaining)"
        location="Manila Office - IT Department"
        warrantyDate="2026-01-15 (1 year, 2 months, 2 weeks remaining)"
        endOfLife="2029-12-31 (5 years, 1 month, 4 weeks remaining)"
        orderNumber="PO-2024-001234"
        purchaseDate="2024-01-15"
        purchaseCost="₱65,990.00"
        // Smartphone specific
        imeiNumber="123456789012345"
        connectivity="5G, Wi-Fi 6E, Bluetooth 5.3"
        // Laptop specific (not used for smartphone)
        ssdEncryptionStatus="N/A"
        cpu="A18 Pro chip"
        gpu="6-core GPU"
        operatingSystem="iOS 18"
        ram="8GB"
        screenSize="6.9 inches"
        storageSize="256GB"
        notes="Latest flagship model with advanced camera system and titanium design. Assigned to senior developer for mobile app testing."
        createdAt="2024-01-15 10:30:00"
        updatedAt="2024-11-01 14:45:00"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        checkedOutTo={checkedOutTo}
        actionButtons={actionButtons}
      />
    </>
  );
}

export default AssetViewPage;