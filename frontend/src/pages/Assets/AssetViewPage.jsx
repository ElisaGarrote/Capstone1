import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import DetailedViewPage from "../../components/DetailedViewPage/DetailedViewPage";
import MockupData from "../../data/mockData/assets/assets-mockup-data.json";
import DefaultImage from "../../assets/img/default-image.jpg";
import MediumButtons from "../../components/buttons/MediumButtons";
import { getAssetDetails, getCheckedOutToInfo, getTabs } from "../../data/mockData/assets/assetDetailsData";
import "../../styles/Assets/AssetViewPage.css";
import "../../styles/Assets/AssetEditPage.css";
import ConfirmationModal from "../../components/Modals/DeleteModal";

function AssetViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const foundAsset = MockupData.find((a) => a.id === parseInt(id));
    if (foundAsset) {
      setAsset(foundAsset);
    }
    setIsLoading(false);
  }, [id]);

  if (isLoading) {
    return null;
  }

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

  // Get tabs configuration from data
  const tabs = getTabs();

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const confirmDelete = () => {
    console.log("Deleting asset:", asset.id);
    closeDeleteModal();
    navigate("/assets", {
      state: {
        successMessage: "Asset deleted successfully!",
      },
    });
  };

  const checkedOutTo = getCheckedOutToInfo(asset);
  const handleCloneClick = () => {
    if (asset) {
      navigate(`/assets/edit/${asset.id}`, {
        state: { isClone: true }
      });
    }
  };

  const handleEditClick = () => {
    navigate(`/assets/edit/${asset.id}`);
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

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
        {...getAssetDetails(asset)}
        assetImage={asset.image ? `https://assets-service-production.up.railway.app${asset.image}` : DefaultImage}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        checkedOutTo={checkedOutTo}
        actionButtons={actionButtons}
        showCheckoutLog
      />
    </>
  );
}

export default AssetViewPage;