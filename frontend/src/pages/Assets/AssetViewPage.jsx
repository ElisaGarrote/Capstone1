import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import DetailedViewPage from "../../components/DetailedViewPage/DetailedViewPage";
import DefaultImage from "../../assets/img/default-image.jpg";
import MediumButtons from "../../components/buttons/MediumButtons";
import SystemLoading from "../../components/Loading/SystemLoading";
import Alert from "../../components/Alert";
import ConfirmationModal from "../../components/Modals/DeleteModal";
import { fetchAssetById, deleteAsset } from "../../services/assets-service";
import { fetchLocationById } from "../../services/integration-help-desk-service";
import "../../styles/Assets/AssetViewPage.css";
import "../../styles/Assets/AssetEditPage.css";

function AssetViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [checkoutLogData, setCheckoutLogData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadAssetDetails = async () => {
      try {
        setIsLoading(true);

        // Fetch asset data - the API now returns all related data
        const assetData = await fetchAssetById(id);
        console.log(assetData)
        if (!assetData) {
          return;
        }
        setAsset(assetData);

        // Process checkout logs from the API response
        const processedLog = await processCheckoutLog(assetData.checkout_logs || []);
        setCheckoutLogData(processedLog);
      } catch (error) {
        console.error("Error loading asset details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Process checkout log data - interleave checkouts and checkins by created_at
    const processCheckoutLog = async (logs) => {
      if (!logs || logs.length === 0) return [];

      const logEntries = [];

      // Collect all location IDs for batch fetching
      const locationIds = [...new Set(logs.map(log => log.location).filter(Boolean))];
      const locationMap = {};

      // Fetch all location names in parallel
      if (locationIds.length > 0) {
        const locationPromises = locationIds.map(locId =>
          fetchLocationById(locId).catch(() => null)
        );
        const locationResults = await Promise.all(locationPromises);
        locationIds.forEach((locId, idx) => {
          locationMap[locId] = locationResults[idx]?.name || `Location ${locId}`;
        });
      }

      // Get condition label
      const conditionLabels = {
        1: '1 - Non-functional',
        2: '2 - Barely Usable',
        3: '3 - Poor',
        4: '4 - Below Average',
        5: '5 - Average',
        6: '6 - Above Average',
        7: '7 - Good',
        8: '8 - Very Good',
        9: '9 - Like New',
        10: '10 - New'
      };

      for (const log of logs) {
        if (log.type === 'checkout') {
          const checkoutDate = log.checkout_date
            ? new Date(log.checkout_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : '-';
          const returnDate = log.return_date
            ? new Date(log.return_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : '-';

          logEntries.push({
            type: 'checkout',
            createdAt: new Date(log.created_at),
            actionLabel: 'Checked out to',
            target: locationMap[log.location] || `Location ${log.location}`,
            checkoutDate,
            expectedReturnDate: returnDate,
            condition: conditionLabels[log.condition] || log.condition,
            user: 'Demo User', // TODO: Get actual user from auth
          });
        } else if (log.type === 'checkin') {
          const checkinDate = log.checkin_date
            ? new Date(log.checkin_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : '-';

          logEntries.push({
            type: 'checkin',
            createdAt: new Date(log.created_at),
            actionLabel: 'Checked in from',
            target: locationMap[log.location] || `Location ${log.location}`,
            checkinDate,
            condition: conditionLabels[log.condition] || log.condition,
            user: 'Demo User', // TODO: Get actual user from auth
          });
        }
      }

      // Sort by created_at descending (newest first)
      logEntries.sort((a, b) => b.createdAt - a.createdAt);

      return logEntries;
    };

    loadAssetDetails();
  }, [id]);

  if (isLoading) {
    return <SystemLoading />;
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

  // Build tabs with counts from API data
  const tabs = [
    { label: "About" },
    { label: "Checkout Log" },
    { label: `History (${asset.history?.length || 0})` },
    { label: `Components (${asset.components?.length || 0})` },
    { label: `Repair (${asset.repairs?.length || 0})` },
    { label: `Audits (${asset.audits?.length || 0})` },
    { label: "Attachments (0)" }
  ];

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const handleDeleteSuccess = () => {
    navigate("/assets", {
      state: { successMessage: "Asset deleted successfully!" },
    });
  };

  const handleDeleteError = (error) => {
    console.error("Error deleting asset:", error);
    setErrorMessage("Failed to delete asset");
    setTimeout(() => setErrorMessage(""), 5000);
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleCloneClick = () => {
    navigate(`/assets/edit/${asset.id}`, { state: { isClone: true } });
  };

  const handleEditClick = () => {
    navigate(`/assets/edit/${asset.id}`);
  };

  const handleCheckInOut = () => {
    const assetId = asset.id;
    const assetDisplayId = asset.asset_id;
    const assetName = asset.name;
    const checkoutId = asset.active_checkout;

    if (checkoutId) {
      navigate(`/assets/check-in/${assetId}`, {
        state: { assetId, assetDisplayId, assetName, checkoutId, ticket: null },
      });
    } else {
      navigate(`/assets/check-out/${assetId}`, {
        state: { assetId, assetDisplayId, assetName, ticket: null },
      });
    }
  };

  // Determine checkout/checkin button state
  const getCheckoutState = () => {
    const status = asset.status_details?.type;
    const hasTicket = !!asset.ticket_details;
    const checkoutDate = asset.ticket_details?.checkout_date;
    
    // Check if checkout date is in the future (compare date only, not time)
    const isFutureCheckout = checkoutDate ? new Date(checkoutDate).toDateString() > new Date().toDateString() : false;

    // No actions for undeployable or archived
    if (status === "undeployable" || status === "archived") {
      return {
        showCheckin: false,
        showCheckout: false,
        checkoutDisabled: false,
      };
    }

    // If status is unknown/undefined, show checkout (disabled) as fallback
    if (!status) {
      return {
        showCheckin: false,
        showCheckout: true,
        checkoutDisabled: true,
      };
    }

    // Checkout is disabled if: No ticket OR checkout_date is in the future
    const checkoutDisabled = !hasTicket || isFutureCheckout;

    return {
      showCheckin: status === "deployed",
      showCheckout: status === "pending" || status === "deployable",
      checkoutDisabled,
    };
  };

  const checkoutState = getCheckoutState();

  // Debug logging
  console.log("AssetViewPage checkout state:", {
    status: asset?.status_details?.type,
    hasTicket: !!asset?.ticket_details,
    checkoutDate: asset?.ticket_details?.checkout_date,
    isFutureCheckout: asset?.ticket_details?.checkout_date ? new Date(asset.ticket_details.checkout_date).toDateString() > new Date().toDateString() : false,
    checkoutState
  });

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return null;
    return `₱${parseFloat(value).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  // Extract nested details from API response
  const product = asset.product_details;
  const supplier = asset.supplier_details;
  const location = asset.location_details;
  const category = product?.category_details;
  const manufacturer = product?.manufacturer_details;
  const depreciation = product?.depreciation_details;

  // Format depreciation duration left
  const formatDepreciationDurationLeft = (durationLeft) => {
    if (durationLeft === undefined || durationLeft === null) return null;
    if (durationLeft === 0) return "Fully Depreciated";

    const years = Math.floor(durationLeft / 12);
    const months = durationLeft % 12;

    const parts = [];
    if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
    if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);

    return parts.length > 0 ? parts.join(', ') + ' left' : 'Fully Depreciated';
  };

  const fullyDepreciatedDisplay = depreciation
    ? formatDepreciationDurationLeft(depreciation.duration_left)
    : null;

  // Build asset details for DetailedViewPage
  const assetDetails = {
    breadcrumbRoot: "Assets",
    breadcrumbCurrent: "Show Asset",
    breadcrumbRootPath: "/assets",
    title: asset.name || product?.name || "Unnamed Asset",
    subtitle: `Asset ID: ${asset.asset_id}`,
    assetTag: asset.asset_id,
    status: asset.status_details?.name || "Unknown",
    statusType: asset.status_details?.type || "unknown",
    company: "Zip Technology Corp.",
    nextAuditDate: asset.audits?.[0]?.schedule_date || null,
    manufacturer: manufacturer?.name || null,
    manufacturerUrl: manufacturer?.website_url || null,
    supportUrl: manufacturer?.website_url || null,
    supportPhone: manufacturer?.support_phone || null,
    supportEmail: manufacturer?.support_email || null,
    category: category?.name || null,
    model: product?.name || null,
    modelNo: product?.model_number || null,
    productName: asset.name || product?.name || null,
    serialNumber: asset.serial_number || null,
    supplier: supplier?.name || null,
    depreciationType: depreciation?.name || null,
    fullyDepreciatedDate: fullyDepreciatedDisplay,
    location: location?.name || null,
    warrantyDate: formatDate(asset.warranty_expiration),
    endOfLife: product?.end_of_life ? formatDate(product.end_of_life) : null,
    orderNumber: asset.order_number || null,
    purchaseDate: formatDate(asset.purchase_date),
    purchaseCost: formatCurrency(asset.purchase_cost),
    cpu: product?.cpu || null,
    gpu: product?.gpu || null,
    operatingSystem: product?.os || null,
    ram: product?.ram || null,
    screenSize: product?.size || null,
    storageSize: product?.storage || null,
    notes: asset.notes || null,
    createdAt: asset.created_at ? new Date(asset.created_at).toLocaleString() : null,
    updatedAt: asset.updated_at ? new Date(asset.updated_at).toLocaleString() : null,
  };

  const actionButtons = (
    <div className="vertical-action-buttons">
      <button type="button" className="action-btn clone-btn" onClick={handleCloneClick}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style={{ marginRight: '8px' }}>
          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
        </svg>
        Clone
      </button>
      <button type="button" className="action-btn edit-btn" onClick={handleEditClick}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style={{ marginRight: '8px' }}>
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
        </svg>
        Edit
      </button>
      {checkoutState.showCheckin && (
        <button type="button" className="action-btn action-btn-checkin" onClick={handleCheckInOut} title="Check In">
          <i className="fas fa-sign-in-alt"></i>
          <span>Check-In</span>
        </button>
      )}
      {checkoutState.showCheckout && (
        <button 
          type="button" 
          className="action-btn action-btn-checkout" 
          onClick={handleCheckInOut} 
          disabled={checkoutState.checkoutDisabled}
          title={checkoutState.checkoutDisabled ? "Checkout not available. Ensure ticket exists and checkout date has arrived." : "Check Out"}
        >
          <i className="fas fa-sign-out-alt"></i>
          <span>Check-Out</span>
        </button>
      )}
      <MediumButtons type="delete" onClick={handleDeleteClick} />
    </div>
  );

  // Get image URL
  const imageUrl = asset.image
    ? (asset.image.startsWith('http') ? asset.image : `${import.meta.env.VITE_ASSETS_API_URL}${asset.image}`)
    : DefaultImage;

  return (
    <>
      <NavBar />
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          closeModal={closeDeleteModal}
          actionType="delete"
          entityType="asset"
          targetId={asset.id}
          onSuccess={handleDeleteSuccess}
          onError={handleDeleteError}
        />
      )}
      <DetailedViewPage
        {...assetDetails}
        assetImage={imageUrl}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        actionButtons={actionButtons}
        showCheckoutLog
        checkoutLogData={checkoutLogData}
      />
    </>
  );
}

export default AssetViewPage;