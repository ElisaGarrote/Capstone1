import "../../styles/AssetViewModal.css";
import CloseIcon from "../../assets/icons/close.svg";
import DefaultImage from "../../assets/img/default-image.jpg";
import { useNavigate } from "react-router-dom";

export default function AssetViewModal({ asset, closeModal }) {
  const navigate = useNavigate();

  const imageSrc = asset.image
  ? `https://assets-service-production.up.railway.app${asset.image}`
  : DefaultImage;
  const assetId = asset.displayed_id;
  const productName = asset.name || asset.product || "Unnamed Asset";
  const serialNumber = asset.serialNumber || asset.serial_number || "-";
  const purchaseDate = asset.purchaseDate || asset.purchase_date || "-";
  const warrantyExpiration = asset.warrantyExpiration || asset.warranty_expiration || "-";
  const orderNumber = asset.orderNumber || asset.order_number || "-";
  const purchaseCost = asset.purchaseCost || asset.purchase_cost
    ? `PHP ${asset.purchaseCost || asset.purchase_cost}`
    : "-";
  const location = asset.location || "-";
  const notes = asset.notes || "-";
  const status = asset.status || "-";
  const supplier = asset.supplier || "-";

  // To be configured
  const handleCheckInOut = () => {
    closeModal();

    const stateData = {
      id: asset.id,
      image: imageSrc,
      assetId,
      product: productName,
    };

    if (asset.status === "Deployed") {
      navigate(`/assets/check-in/${asset.id}`, {
        state: {
          ...stateData,
          employee: "Elphaba Thropp", // Replace with dynamic data when available
          checkOutDate: "2023-10-01", // Replace with real dates if available
          returnDate: "2023-10-15",
          condition: "Good",
        },
      });
    } else {
      navigate(`/assets/check-out/${asset.id}`, {
        state: stateData,
      });
    }
  };

     const handleView = async (productId) => {
    console.log("product id:", productId)
    try {
      const assetResponse = await assetsService.fe(assetId);
      console.log("Full assetResponse:", assetResponse);
      const assetData = assetResponse;
      console.log("assetData:", assetData, typeof assetData);

      if (!assetData) {
        setErrorMessage("Asset details not found.");
        setLoading(false);
        return;
      }

      let supplierName = "Unknown Supplier";
      if (assetData.supplier_id) {
        const supplierResponse = await contextsService.fetchSuppNameById(assetData.supplier_id);
        supplierName = supplierResponse.supplier?.name || supplierName;
      }

      const assetWithSupplier = {
        ...assetData,
        supplier: supplierName,
        product: assetData.product_info?.name || "-",
        status: assetData.status_info?.name || "-",
      };

      setSelectedAsset(assetWithSupplier);
      setViewModalOpen(true);
    } catch (error) {
      console.error("Error fetching asset or supplier details:", error);
      setErrorMessage("Failed to load asset details.");
    }
  };

  return (
    <main className="asset-view-modal">
      <div className="overlay" onClick={closeModal}></div>
      <div className="content">
        <button onClick={closeModal} className="close-button">
          <img src={CloseIcon} alt="Close" />
        </button>

        <fieldset className="header-fieldset">
          <img src={imageSrc} alt="Asset" onError={(e) => { e.target.src = DefaultImage; }} />
          <h2>{productName}</h2>
        </fieldset>

        <div className="details-container">
          <section className="left-content">
            <fieldset className="detail-item">
              <label>Asset ID</label>
              <p>{assetId}</p>
            </fieldset>

            <fieldset className="detail-item">
              <label>Product</label>
              <p>{productName}</p>
            </fieldset>

            <fieldset className="detail-item">
              <label>Serial Number</label>
              <p>{serialNumber}</p>
            </fieldset>

            <fieldset className="detail-item">
              <label>Status</label>
              <p>{status}</p>
            </fieldset>

            <fieldset className="detail-item">
              <label>Location</label>
              <p>{location}</p>
            </fieldset>

            <fieldset className="detail-item">
              <label>Purchase Date</label>
              <p>{purchaseDate}</p>
            </fieldset>
          </section>

          <section className="right-content">
            <fieldset className="detail-item">
              <label>Supplier</label>
              <p>{supplier}</p>
            </fieldset>

            <fieldset className="detail-item">
              <label>Warranty Expiration</label>
              <p>{warrantyExpiration}</p>
            </fieldset>

            <fieldset className="detail-item">
              <label>Order Number</label>
              <p>{orderNumber}</p>
            </fieldset>

            <fieldset className="detail-item">
              <label>Purchase Cost</label>
              <p>{purchaseCost}</p>
            </fieldset>

            <fieldset className="detail-item">
              <label>Notes</label>
              <p>{notes}</p>
            </fieldset>

            <button
              className={
                asset.status === "Deployed"
                  ? "checkin-btn detail-button"
                  : "checkout-btn detail-button"
              }
              onClick={handleCheckInOut}
            >
              {asset.status === "Deployed" ? "Check-In" : "Check-Out"}
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}