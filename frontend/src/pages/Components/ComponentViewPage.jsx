import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import DetailedViewPage from "../../components/DetailedViewPage/DetailedViewPage";
import MediumButtons from "../../components/buttons/MediumButtons";
import ActionButtons from "../../components/ActionButtons";
import { fetchComponentById } from "../../services/assets-service";
import { getComponentDetails, getComponentTabs } from "../../data/mockData/components/componentDetailsData";
import ConfirmationModal from "../../components/Modals/DeleteModal";
import SystemLoading from "../../components/Loading/SystemLoading";

function ComponentView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [component, setComponent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const loadComponent = async () => {
      try {
        setIsLoading(true);
        const data = await fetchComponentById(id);
        setComponent(data);
      } catch (error) {
        console.error("Error loading component:", error);
        setComponent(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadComponent();
    }
  }, [id]);

  if (isLoading) {
    return <SystemLoading />;
  }

  if (!component) {
    return (
      <>
        <NavBar />
        <div style={{ padding: "40px", textAlign: "center" }}>
          <h2>Component not found</h2>
        </div>
      </>
    );
  }

  const tabs = getComponentTabs();
  const componentDetails = getComponentDetails(component);

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const handleDeleteSuccess = () => {
    navigate("/components", { state: { successMessage: "Component deleted successfully!" } });
  };

  const handleDeleteError = (error) => {
    console.error("Error deleting component:", error);
  };

  const handleEditClick = () => {
    navigate(`/components/edit/${component.id}`, {
      state: { component }
    });
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

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

  // Helper to format purchase cost
  const formatCost = (cost) => {
    if (cost === null || cost === undefined) return "N/A";
    return `₱${parseFloat(cost).toFixed(2)}`;
  };

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString();
  };

  const aboutContent = (
    <div className="about-section">
      <div className="component-details-section">
        <h3 className="section-header">Details</h3>
        <div className="component-details-grid">
          <div className="detail-row">
            <label>Component Name</label>
            <span>{component.name || "N/A"}</span>
          </div>

          <div className="detail-row">
            <label>Category</label>
            <span>{component.category_details?.name || "N/A"}</span>
          </div>

          <div className="detail-row">
            <label>Manufacturer</label>
            <span>{component.manufacturer_details?.name || "N/A"}</span>
          </div>

          <div className="detail-row">
            <label>Supplier</label>
            <span>{component.supplier_details?.name || "N/A"}</span>
          </div>

          <div className="detail-row">
            <label>Model Number</label>
            <span>{component.model_number || "N/A"}</span>
          </div>

          <div className="detail-row">
            <label>Order Number</label>
            <span>{component.order_number || "N/A"}</span>
          </div>

          <div className="detail-row">
            <label>Location</label>
            <span>{component.location_details?.name || component.location_details?.city || "N/A"}</span>
          </div>

          <div className="detail-row">
            <label>Purchase Cost</label>
            <span>{formatCost(component.purchase_cost)}</span>
          </div>

          <div className="detail-row">
            <label>Total Quantity</label>
            <span>{component.quantity ?? "N/A"}</span>
          </div>

          <div className="detail-row">
            <label>Available Quantity</label>
            <span>{component.available_quantity ?? "N/A"}</span>
          </div>

          <div className="detail-row">
            <label>Checked Out Quantity</label>
            <span>{(component.quantity - component.available_quantity) || 0}</span>
          </div>

          <div className="detail-row">
            <label>Minimum Quantity</label>
            <span>{component.minimum_quantity ?? "N/A"}</span>
          </div>

          <div className="detail-row">
            <label>Purchase Date</label>
            <span>{formatDate(component.purchase_date)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Active checkouts - component.active_checkouts populated by API if available
  const activeCheckouts = component.active_checkouts || [];

  // History - component.checkout_history populated by API if available
  const componentHistory = component.checkout_history || [];

  // Custom tab content for Active Checkouts and History
  const customTabContent = activeTab === 1 ? (
    <div className="components-tab-wrapper">
      <div className="components-tab-header">
        <h3>Active Checkouts</h3>
      </div>
      <section className="components-detail-table-section">
        <table>
          <thead>
            <tr>
              <th>CHECKOUT DATE</th>
              <th>USER</th>
              <th>CHECKED OUT TO</th>
              <th>NOTES</th>
              <th>CHECKIN</th>
            </tr>
          </thead>
          <tbody>
            {activeCheckouts.length > 0 ? (
              activeCheckouts.map((checkout, index) => (
                <tr key={index}>
                  <td>{new Date(checkout.checkout_date).toLocaleDateString()}</td>
                  <td>N/A</td>
                  <td>{checkout.to_asset?.displayed_id || 'N/A'}</td>
                  <td>{checkout.notes}</td>
                  <td>
                    <ActionButtons
                      showCheckin
                      onCheckinClick={() => {
                        navigate(`/components/check-in/${component.id}`, {
                          state: {
                            item: {
                              id: component.id,
                              name: component.name,
                              available_quantity: component.available_quantity,
                              remaining_quantity: checkout.remaining_quantity,
                            },
                            componentName: component.name,
                          },
                        });
                      }}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="no-data-message">
                  No Active Checkouts Found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  ) : activeTab === 2 ? (
    <div className="components-tab-wrapper">
      <div className="components-tab-header">
        <h3>History</h3>
      </div>
      <section className="components-detail-table-section">
        <table>
          <thead>
            <tr>
              <th>CHECKIN DATE</th>
              <th>USER</th>
              <th>CHECKED OUT TO</th>
              <th>NOTES</th>
            </tr>
          </thead>
          <tbody>
            {componentHistory.length > 0 ? (
              componentHistory.map((history, index) => (
                <tr key={index}>
                  <td>{new Date(history.checkin_date).toLocaleDateString()}</td>
                  <td>{history.handled_by || 'N/A'}</td>
                  <td>{history.checkout?.to_asset?.displayed_id || 'N/A'}</td>
                  <td>{history.notes}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="no-data-message">
                  No History Found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  ) : null;

  return (
    <>
      <NavBar />
      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          closeModal={closeDeleteModal}
          actionType="delete"
          entityType="component"
          targetId={component.id}
          onSuccess={handleDeleteSuccess}
          onError={handleDeleteError}
        />
      )}
      <DetailedViewPage
        {...componentDetails}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        actionButtons={actionButtons}
        customTabContent={customTabContent}
        notes={component.notes || "N/A"}
        createdAt={formatDate(component.created_at)}
        updatedAt={formatDate(component.updated_at)}
      >
        {activeTab === 0 && aboutContent}
      </DetailedViewPage>
    </>
  );
}

export default ComponentView;