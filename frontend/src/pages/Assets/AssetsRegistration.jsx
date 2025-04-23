import NavBar from "../../components/NavBar";
import "../../styles/Registration.css";
import { useNavigate, useParams } from "react-router-dom";
import MediumButtons from "../../components/buttons/MediumButtons";
import TopSecFormPage from "../../components/TopSecFormPage";
import CloseIcon from "../../assets/icons/close.svg";
import { useState, useEffect } from "react";
import SampleImage from "../../assets/img/dvi.jpeg";

export default function AssetsRegistration() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentDate = new Date().toISOString().split("T")[0];

  const assetsData = {
    "1": {
      image: SampleImage,
      assetId: 10001,
      assetName: null,
      serialNumber: 'GC1SJL3',
      product: 'XPS 13',
      status: 'Ready for Deployment',
      supplier: 'Amazon',
      location: 'Makati City',
      warrantyExpiration: '2027-05-02',
      orderNumber: 'GJ08CX',
      purchaseDate: '2025-04-01',
      purchaseCost: 25000,
      notes: 'Laptop for software development.',
    },
    "2": {
      image: SampleImage,
      assetId: 10002,
      assetName: 'Logitech Mouse',
      serialNumber: 'LOGI789',
      product: 'Mouse',
      status: 'Deployed',
      supplier: 'GadgetWorld',
      location: 'Quezon City',
      warrantyExpiration: '2027-05-02',
      orderNumber: '67890',
      purchaseDate: '2025-04-01',
      purchaseCost: 30000,
      notes: null,
    }
  };

  const statusList = ['Ready for Deployment', 'Deployed'];
  const supplierList = ['Amazon', 'TechCorp', 'GadgetWorld', 'GizmoHub'];
  const locationList = ['Office', 'Makati City', 'Quezon City', 'Cebu City', 'Davao City'];

  const [previewImage, setPreviewImage] = useState(null);
  const [asset, setAsset] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchedAsset = assetsData[id];
      if (fetchedAsset) {
        setAsset(fetchedAsset);
      }
    } else {
      setAsset({
        image: null,
        assetId: '',
        assetName: '',
        serialNumber: '',
        product: '',
        status: '',
        supplier: '',
        location: '',
        warrantyExpiration: '',
        endOfLife: '',
        orderNumber: '',
        purchaseDate: '',
        purchaseCost: '',
        notes: '',
      });
    }
  }, [id]);

  const handleImageSelection = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setPreviewImage(null);
    }
  };

  if (!asset) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="registration">
        <section className="top">
          <TopSecFormPage
            root="Assets"
            currentPage={id ? "Edit Asset" : "New Asset"}
            rootNavigatePage="/assets"
            title={id ? "Edit Asset" : "New Asset"}
          />
        </section>
        <section className="registration-form">
          <form action="" method="post">
            <fieldset>
              <label htmlFor="asset-id">Asset ID *</label>
              <input
                type="text"
                name="assetId"
                placeholder="Asset ID"
                maxLength="100"
                defaultValue={asset?.assetId || ""}
                readOnly={false}
              />
            </fieldset>
            <fieldset>
              <label htmlFor="product">Product *</label>
              <input
                type="text"
                name="product"
                placeholder="Product"
                maxLength="100"
                defaultValue={asset?.product || ""}
                readOnly={false}
              />
            </fieldset>
            <fieldset>
              <label htmlFor="status">Status *</label>
              <div>
                <select name="status" defaultValue={asset?.status || ""}>
                  <option value="">Select Status</option>
                  {statusList.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
                <MediumButtons type="new" />
              </div>
            </fieldset>
            <fieldset>
              <label htmlFor="supplier">Supplier</label>
              <div>
                <select name="supplier" defaultValue={asset?.supplier || ""}>
                  <option value="">Select Supplier</option>
                  {supplierList.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
                <MediumButtons type="new" />
              </div>
            </fieldset>
            <fieldset>
              <label htmlFor="location">Location</label>
              <div>
                <select name="location" defaultValue={asset?.location || ""}>
                  <option value="">Select Location</option>
                  {locationList.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
                <MediumButtons type="new" />
              </div>
            </fieldset>
            <fieldset>
              <label htmlFor="asset-name">Asset Name</label>
              <input
                type="text"
                name="assetName"
                placeholder="Asset Name"
                maxLength="100"
                defaultValue={asset?.assetName || ""}
                readOnly={false}
              />
            </fieldset>
            <fieldset>
              <label htmlFor="serial-number">Serial Number</label>
              <input
                type="text"
                name="serialNumber"
                placeholder="Serial Number"
                maxLength="50"
                defaultValue={asset?.serialNumber || ""}
                readOnly={false}
              />
            </fieldset>
            <fieldset>
              <label htmlFor="warranty-expiration">Warranty Expiration Date</label>
              <input
                type="date"
                name="warrantyExpiration"
                min={!id ? currentDate : undefined}
                defaultValue={asset?.warrantyExpiration || ""}
                readOnly={false}
              />
            </fieldset>
            <fieldset>
              <label htmlFor="order-number">Order Number</label>
              <input
                type="text"
                name="orderNumber"
                placeholder="Order Number"
                maxLength="30"
                defaultValue={asset?.orderNumber || ""}
                readOnly={false}
              />
            </fieldset>
            <fieldset>
              <label htmlFor="purchase-date">Purchase Date</label>
              <input
                type="date"
                name="purchaseDate"
                max={!id ? currentDate : undefined}
                defaultValue={asset?.purchaseDate || ""}
                readOnly={false}
              />
            </fieldset>
            <fieldset>
              <label htmlFor="purchase-cost">Purchase Cost</label>
              <div>
                <p>PHP</p>
                <input
                  type="number"
                  name="purchaseCost"
                  step="0.01"
                  min="1"
                  defaultValue={asset?.purchaseCost || ""}
                  readOnly={false}
                />
              </div>
            </fieldset>
            <fieldset>
              <label htmlFor="notes">Notes</label>
              <textarea
                name="notes"
                maxLength="500"
                defaultValue={asset?.notes || ""}
                readOnly={false}
              ></textarea>
            </fieldset>
            <fieldset>
              <label htmlFor="upload-image">Image</label>
              <div>
                {previewImage && (
                  <div className="image-selected">
                    <img src={previewImage} alt="Preview" />
                    <button
                      onClick={(event) => {
                        event.preventDefault();
                        setPreviewImage(null);
                        document.getElementById("image").value = "";
                      }}
                    >
                      <img src={CloseIcon} alt="Remove" />
                    </button>
                  </div>
                )}
                {!previewImage && asset?.image && (
                  <div className="image-selected">
                    <img src={asset.image} alt="Current" />
                  </div>
                )}
                <input
                  type="file"
                  name="image"
                  id="image"
                  accept="image/*"
                  onChange={handleImageSelection}
                  style={{ display: "none" }}
                />
              </div>
              <label htmlFor="image" className="upload-image-btn">
                {!previewImage ? "Choose Image" : "Change Image"}
              </label>
            </fieldset>
            <button type="submit" className="save-btn">
              Save
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
