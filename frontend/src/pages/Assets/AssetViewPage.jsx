import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import DetailedViewPage from "../../components/DetailedViewPage/DetailedViewPage";
import DefaultImage from "../../assets/img/default-image.jpg";
import MediumButtons from "../../components/buttons/MediumButtons";
import SystemLoading from "../../components/Loading/SystemLoading";
import ConfirmationModal from "../../components/Modals/DeleteModal";
import { fetchAssetById, fetchProductById, deleteAsset, fetchAssetCheckoutsByAsset } from "../../services/assets-service";
import { fetchSupplierById, fetchCategoryById, fetchManufacturerById, fetchDepreciationById } from "../../services/contexts-service";
import { fetchLocationById } from "../../services/integration-help-desk-service";

// Helper function to calculate depreciation info
const calculateDepreciationInfo = (purchaseDate, durationMonths) => {
  if (!purchaseDate || !durationMonths) return null;

  const purchase = new Date(purchaseDate);
  const fullyDepreciatedDate = new Date(purchase);
  fullyDepreciatedDate.setMonth(fullyDepreciatedDate.getMonth() + durationMonths);

  const today = new Date();
  const msRemaining = fullyDepreciatedDate.getTime() - today.getTime();

  if (msRemaining <= 0) {
    return {
      fullyDepreciatedDate,
      isFullyDepreciated: true,
      remaining: null
    };
  }

  // Calculate years, months, weeks remaining
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
  const years = Math.floor(daysRemaining / 365);
  const remainingAfterYears = daysRemaining % 365;
  const months = Math.floor(remainingAfterYears / 30);
  const weeks = Math.floor((remainingAfterYears % 30) / 7);

  return {
    fullyDepreciatedDate,
    isFullyDepreciated: false,
    remaining: { years, months, weeks }
  };
};

// Format depreciation remaining time
const formatDepreciationRemaining = (depInfo) => {
  if (!depInfo) return null;

  const dateStr = depInfo.fullyDepreciatedDate.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  if (depInfo.isFullyDepreciated) {
    return `${dateStr} (Fully Depreciated)`;
  }

  const parts = [];
  if (depInfo.remaining.years > 0) {
    parts.push(`${depInfo.remaining.years} year${depInfo.remaining.years > 1 ? 's' : ''}`);
  }
  if (depInfo.remaining.months > 0) {
    parts.push(`${depInfo.remaining.months} month${depInfo.remaining.months > 1 ? 's' : ''}`);
  }
  if (depInfo.remaining.weeks > 0) {
    parts.push(`${depInfo.remaining.weeks} week${depInfo.remaining.weeks > 1 ? 's' : ''}`);
  }

  const remainingStr = parts.length > 0 ? parts.join(', ') + ' left' : 'Less than a week left';
  return `${dateStr} (${remainingStr})`;
};
import "../../styles/Assets/AssetViewPage.css";
import "../../styles/Assets/AssetEditPage.css";

function AssetViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [product, setProduct] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [location, setLocation] = useState(null);
  const [category, setCategory] = useState(null);
  const [manufacturer, setManufacturer] = useState(null);
  const [depreciation, setDepreciation] = useState(null);
  const [checkoutLogData, setCheckoutLogData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const loadAssetDetails = async () => {
      try {
        setIsLoading(true);

        // Fetch asset data
        const assetData = await fetchAssetById(id);
        if (!assetData) {
          return;
        }
        setAsset(assetData);

        // Fetch related data in parallel - use allSettled to handle partial failures
        const [productResult, supplierResult, locationResult, checkoutsResult] = await Promise.allSettled([
          assetData.product ? fetchProductById(assetData.product) : Promise.resolve(null),
          assetData.supplier ? fetchSupplierById(assetData.supplier) : Promise.resolve(null),
          assetData.location ? fetchLocationById(assetData.location) : Promise.resolve(null),
          fetchAssetCheckoutsByAsset(assetData.id),
        ]);

        const productData = productResult.status === 'fulfilled' ? productResult.value : null;
        const supplierData = supplierResult.status === 'fulfilled' ? supplierResult.value : null;
        const locationData = locationResult.status === 'fulfilled' ? locationResult.value : null;
        const checkoutsData = checkoutsResult.status === 'fulfilled' ? checkoutsResult.value : [];

        setProduct(productData);
        setSupplier(supplierData);
        setLocation(locationData);

        // Process checkout/checkin data for the log
        // We need to fetch location names for each checkout
        const processedLog = await processCheckoutLog(checkoutsData);
        setCheckoutLogData(processedLog);

        // If product exists, fetch category, manufacturer, and depreciation
        if (productData) {
          const [categoryResult, manufacturerResult, depreciationResult] = await Promise.allSettled([
            productData.category ? fetchCategoryById(productData.category) : Promise.resolve(null),
            productData.manufacturer ? fetchManufacturerById(productData.manufacturer) : Promise.resolve(null),
            productData.depreciation ? fetchDepreciationById(productData.depreciation) : Promise.resolve(null),
          ]);
          setCategory(categoryResult.status === 'fulfilled' ? categoryResult.value : null);
          setManufacturer(manufacturerResult.status === 'fulfilled' ? manufacturerResult.value : null);
          setDepreciation(depreciationResult.status === 'fulfilled' ? depreciationResult.value : null);
        }
      } catch (error) {
        console.error("Error loading asset details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Process checkout log data - interleave checkouts and checkins by created_at
    const processCheckoutLog = async (checkouts) => {
      if (!checkouts || checkouts.length === 0) return [];

      const logEntries = [];

      // Fetch all location names in parallel
      const locationIds = [...new Set(checkouts.map(c => c.location).filter(Boolean))];
      const locationPromises = locationIds.map(locId =>
        fetchLocationById(locId).catch(() => null)
      );
      const locationResults = await Promise.all(locationPromises);
      const locationMap = {};
      locationIds.forEach((locId, idx) => {
        locationMap[locId] = locationResults[idx]?.name || `Location ${locId}`;
      });

      for (const checkout of checkouts) {
        // Add checkout entry
        const checkoutDate = checkout.checkout_date
          ? new Date(checkout.checkout_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
          : '-';
        const returnDate = checkout.return_date
          ? new Date(checkout.return_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
          : '-';

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

        logEntries.push({
          type: 'checkout',
          createdAt: new Date(checkout.created_at),
          actionLabel: 'Checked out to',
          target: locationMap[checkout.location] || `Location ${checkout.location}`,
          checkoutDate,
          expectedReturnDate: returnDate,
          condition: conditionLabels[checkout.condition] || checkout.condition,
          user: 'Demo User', // TODO: Get actual user from auth
        });

        // Add checkin entry if exists
        if (checkout.asset_checkin) {
          const checkin = checkout.asset_checkin;
          const checkinDate = checkin.checkin_date
            ? new Date(checkin.checkin_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : '-';

          // Fetch checkin location name
          let checkinLocationName = `Location ${checkin.location}`;
          if (checkin.location && locationMap[checkin.location]) {
            checkinLocationName = locationMap[checkin.location];
          } else if (checkin.location) {
            try {
              const locData = await fetchLocationById(checkin.location);
              checkinLocationName = locData?.name || checkinLocationName;
            } catch {
              // Use default
            }
          }

          logEntries.push({
            type: 'checkin',
            createdAt: new Date(checkin.created_at),
            actionLabel: 'Checked in from',
            target: checkinLocationName,
            checkinDate,
            condition: conditionLabels[checkin.condition] || checkin.condition,
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

  const confirmDelete = async () => {
    try {
      await deleteAsset(asset.id);
      closeDeleteModal();
      navigate("/assets", {
        state: { successMessage: "Asset deleted successfully!" },
      });
    } catch (error) {
      console.error("Error deleting asset:", error);
      setErrorMessage("Failed to delete asset");
      closeDeleteModal();
    }
  };

  const handleCloneClick = () => {
    navigate(`/assets/edit/${asset.id}`, { state: { isClone: true } });
  };

  const handleEditClick = () => {
    navigate(`/assets/edit/${asset.id}`);
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

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

  // Calculate fully depreciated info
  const depreciationInfo = calculateDepreciationInfo(asset.purchase_date, depreciation?.duration);
  const fullyDepreciatedDisplay = formatDepreciationRemaining(depreciationInfo);

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
    nextAuditDate: asset.audits?.[0]?.date || null,
    manufacturer: manufacturer?.name || null,
    manufacturerUrl: manufacturer?.url || null,
    supportUrl: manufacturer?.support_url || null,
    supportPhone: manufacturer?.support_phone || null,
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
    screenSize: product?.screen_size || null,
    storageSize: product?.storage_size || null,
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
      {isDeleteModalOpen && (
        <ConfirmationModal
          closeModal={closeDeleteModal}
          actionType="delete"
          onConfirm={confirmDelete}
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