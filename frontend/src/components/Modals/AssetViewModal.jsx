import "../../styles/AssetViewModal.css";
import CloseIcon from "../../assets/icons/close.svg";
import DefaultImage from "../../assets/img/default-image.jpg";
import { useNavigate } from "react-router-dom";

export default function AssetViewModal({ asset, closeModal }) {
  const navigate = useNavigate();
  return (
    <main className="asset-view-modal">
      <div className="overlay" onClick={closeModal}></div>
      <div className="content">
        <button onClick={closeModal} className="close-button">
          <img src={CloseIcon} alt="Close" />
        </button>

        <fieldset className="header-fieldset">
          <img
            src={asset.image || DefaultImage}
            alt="Asset"
          />
          <h2>{asset.assetName || asset.name || asset.product}</h2>
        </fieldset>

        <div className="details-container">
          <section className="left-content">
            <fieldset className="detail-item">
              <label>Asset ID</label>
              <p>{asset.assetId || asset.displayed_id}</p>
            </fieldset>

            <fieldset className="detail-item">
              <label>Product</label>
              <p>{asset.product}</p>
            </fieldset>

            <fieldset className="detail-item">
              <label>Serial Number</label>
              <p>{asset.serialNumber || asset.serial_number || "-"}</p>
            </fieldset>

            <fieldset className="detail-item">
              <label>Status</label>
              <p>{asset.status}</p>
            </fieldset>

            <fieldset className="detail-item">
              <label>Location</label>
              <p>{asset.location || "-"}</p>
            </fieldset>

            <fieldset className="detail-item">
              <label>Purchase Date</label>
              <p>{asset.purchaseDate || asset.purchase_date || "-"}</p>
            </fieldset>
          </section>

          <section className="right-content">
            <fieldset className="detail-item">
              <label>Supplier</label>
              <p>{asset.supplier || "-"}</p>
            </fieldset>

            <fieldset className="detail-item">
              <label>Warranty Expiration</label>
              <p>{asset.warrantyExpiration || asset.warranty_expiration || "-"}</p>
            </fieldset>

            <fieldset className="detail-item">
              <label>Order Number</label>
              <p>{asset.orderNumber || asset.order_number || "-"}</p>
            </fieldset>

            <fieldset className="detail-item">
              <label>Purchase Cost</label>
              <p>{asset.purchaseCost || asset.purchase_cost ? `PHP ${asset.purchaseCost || asset.purchase_cost}` : "-"}</p>
            </fieldset>

            <fieldset className="detail-item">
              <label>Notes</label>
              <p>{asset.notes || "-"}</p>
            </fieldset>

            <button
              className={asset.status === 'Deployed' ? "checkin-btn detail-button" : "checkout-btn detail-button"}
              onClick={() => {
                closeModal();

                if (asset.status === 'Deployed') {
                  navigate(`/assets/check-in/${asset.id}`, {
                    state: {
                      id: asset.id,
                      image: asset.image,
                      assetId: asset.assetId,
                      product: asset.product,
                      employee: "Elphaba Thropp",
                      checkOutDate: "2023-10-01",
                      returnDate: "2023-10-15",
                      condition: "Good",
                    },
                  });
                } else {
                  navigate(`/assets/check-out/${asset.id}`, {
                    state: {
                      id: asset.id,
                      image: asset.image,
                      assetId: asset.assetId,
                      product: asset.product,
                    },
                  });
                }
              }}
            >
              {asset.status === 'Deployed' ? "Check-In" : "Check-Out"}
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}