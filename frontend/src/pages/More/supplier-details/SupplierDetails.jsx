import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavBar from "../../../components/NavBar";
import DetailedViewPage from "../../../components/DetailedViewPage/DetailedViewPage";
import MediumButtons from "../../../components/buttons/MediumButtons";
import { getSupplierDetails, getSupplierTabs } from "../../../data/mockData/more/supplierDetailsData";
import "../../../styles/more/supplier/SupplierDetails.css";
import ConfirmationModal from "../../../components/Modals/DeleteModal";

function SupplierDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Retrieve the "supplier" data value passed from the navigation state.
  const supplierDetails = location.state?.supplier;

  if (!supplierDetails) {
    return (
      <>
        <NavBar />
        <div style={{ padding: "40px", textAlign: "center" }}>
          <h2>Supplier not found</h2>
        </div>
      </>
    );
  }

  // Get tabs configuration from data
  const tabs = getSupplierTabs();

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const confirmDelete = () => {
    // Handle supplier deletion logic here
    console.log("Deleting supplier:", supplierDetails.id);
    closeDeleteModal();
    navigate("/More/ViewSupplier");
  };

  // Button action handlers
  const handleEditClick = () => {
    navigate(`/More/SupplierRegistration/${supplierDetails.id}`, {
      state: { supplier: supplierDetails }
    });
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  // Create action buttons with vertical layout
  const actionButtons = (
    <div className="vertical-action-buttons">
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

  // Render custom About section for suppliers
  const aboutContent = (
    <div className="about-section">
      {/* Details Section */}
      <div className="asset-details-section">
        <h3 className="section-header">Details</h3>
        <div className="asset-details-grid">
          <div className="detail-row">
            <label>Supplier Name</label>
            <span>{supplierDetails.name || 'N/A'}</span>
          </div>

          <div className="detail-row">
            <label>Address</label>
            <span>{supplierDetails.address || 'N/A'}</span>
          </div>

          <div className="detail-row">
            <label>City</label>
            <span>{supplierDetails.city || 'N/A'}</span>
          </div>

          <div className="detail-row">
            <label>State</label>
            <span>{supplierDetails.state || 'N/A'}</span>
          </div>

          <div className="detail-row">
            <label>ZIP</label>
            <span>{supplierDetails.zip || 'N/A'}</span>
          </div>

          <div className="detail-row">
            <label>Country</label>
            <span>{supplierDetails.country || 'N/A'}</span>
          </div>

          <div className="detail-row">
            <label>Contact Name</label>
            <span>{supplierDetails.contactName || 'N/A'}</span>
          </div>

          <div className="detail-row">
            <label>Phone Number</label>
            <span
              style={{ color: 'var(--primary-color)', cursor: 'pointer' }}
              onClick={() =>
                window.open(`tel:${supplierDetails.phoneNumber}`, "_blank")
              }
            >
              {supplierDetails.phoneNumber || 'N/A'}
            </span>
          </div>

          <div className="detail-row">
            <label>Email</label>
            <span
              style={{ color: 'var(--primary-color)', cursor: 'pointer' }}
              onClick={() =>
                window.open(`mailto:${supplierDetails.email}`, "_blank")
              }
            >
              {supplierDetails.email || 'N/A'}
            </span>
          </div>

          <div className="detail-row">
            <label>URL</label>
            <span
              style={{ color: 'var(--primary-color)', cursor: 'pointer' }}
              onClick={() => window.open(supplierDetails.url, "_blank")}
            >
              {supplierDetails.url || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Additional Fields Section */}
      <div className="additional-fields-section">
        <h3 className="section-header">Additional Information</h3>
        <div className="asset-details-grid">
          <div className="detail-row">
            <label>Notes</label>
            <span>{supplierDetails.notes || 'N/A'}</span>
          </div>

          <div className="detail-row">
            <label>Created At</label>
            <span>{supplierDetails.createdAt || 'N/A'}</span>
          </div>

          <div className="detail-row">
            <label>Updated At</label>
            <span>{supplierDetails.updatedAt || 'N/A'}</span>
          </div>
        </div>
      </div>
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
        {...getSupplierDetails(supplierDetails)}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        actionButtons={actionButtons}
      >
        {activeTab === 0 && aboutContent}
      </DetailedViewPage>
    </>
  );
}

export default SupplierDetails;
