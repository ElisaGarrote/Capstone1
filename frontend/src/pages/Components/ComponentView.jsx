import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import DetailedViewPage from "../../components/DetailedViewPage/DetailedViewPage";
import MockupData from "../../data/mockData/assets/assets-mockup-data.json";
import "../../styles/AssetViewPage.css";
import ConfirmationModal from "../../components/Modals/DeleteModal";

function ComponentView() {
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
    { label: "Info" },
    { label: "History" },
    { label: "Files" },
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
  const handleEditClick = () => {
    navigate(`/assets/registration/${asset.id}`);
  };

  const handleCheckInClick = () => {
    console.log("Check-in asset:", asset.id);
  };

  const handleAddNoteClick = () => {
    console.log("Add note to asset:", asset.id);
  };

  const handleAuditClick = () => {
    console.log("Audit asset:", asset.id);
  };

  const handleUploadClick = () => {
    console.log("Upload file for asset:", asset.id);
  };

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
        breadcrumbCurrent={asset.displayed_id + " - " + asset.name}
        breadcrumbRootPath="/assets"
        title={asset.name}
        subtitle={asset.displayed_id}
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
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        checkedOutTo={checkedOutTo}
        onEditClick={handleEditClick}
        onCheckInClick={handleCheckInClick}
        onAddNoteClick={handleAddNoteClick}
        onAuditClick={handleAuditClick}
        onDeleteClick={() => setDeleteModalOpen(true)}
        onUploadClick={handleUploadClick}
      />
    </>
  );
}

export default ComponentView;