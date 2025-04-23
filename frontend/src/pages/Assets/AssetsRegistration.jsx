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
      product: 'XPS 13',
      status: 'Ready for Deployment',
      checkin: true,
      supplier: 'Amazon',
      location: 'Makati City',
      assetName: '',
      serialNumber: 'GC1SJL3',
      warrantyExpiration: '2027-05-02',
      endOfLife: '2025-04-09',
      orderNumber: 'GJ08CX',
      purchaseDate: '2025-04-01',
      purchaseCost: 25000,
      notes: 'Laptop for software development.',
    },
    "2": {
      image: SampleImage,
      assetId: 10002,
      product: 'Mouse',
      status: 'Deployed',
      checkin: false,
      supplier: 'GadgetWorld',
      location: 'Quezon City',
      assetName: 'Logitech Mouse',
      serialNumber: 'LOGI789',
      warrantyExpiration: '2027-05-02',
      endOfLife: '2025-04-09',
      orderNumber: '67890',
      purchaseDate: '2025-04-01',
      purchaseCost: 30000,
      notes: '',
    }
  };

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
        assetId: '',
        product: '',
        status: '',
        supplier: '',
        location: '',
        assetName: '',
        serialNumber: '',
        warrantyExpiration: '',
        endOfLife: '',
        orderNumber: '',
        purchaseDate: '',
        purchaseCost: '',
        notes: '',
        image: null
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
          <form encType="multipart/form-data">
            <fieldset>
              <label htmlFor="asset-id">Asset ID *</label>
              <input
                type="text"
                name="assetId"
                placeholder="Asset ID"
                maxLength="100"
                defaultValue={asset?.assetId || ""}
                readOnly={!id}
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
                readOnly={!id}
              />
            </fieldset>
            <fieldset>
              <label htmlFor="status">Status *</label>
              <div>
                <select name="status" defaultValue={asset?.status || ""}>
                  <option value="">Select Status</option>
                  <option value="Ready for Deployment">Ready For Deployment</option>
                  <option value="Deployed">Deployed</option>
                </select>
                <MediumButtons type="new" disabled={!id} />
              </div>
            </fieldset>
            <fieldset>
              <label htmlFor="supplier">Supplier</label>
              <div>
                <select name="supplier" defaultValue={asset?.supplier || ""}>
                  <option value="">Select Supplier</option>
                  <option value="Amazon">Amazon</option>
                  <option value="TechCorp">TechCorp</option>
                  <option value="GadgetWorld">GadgetWorld</option>
                </select>
                <MediumButtons type="new" disabled={!id} />
              </div>
            </fieldset>
            <fieldset>
              <label htmlFor="location">Location</label>
              <div>
                <select name="location" defaultValue={asset?.location || ""}>
                  <option value="">Select Location</option>
                  <option value="Office">Office</option>
                  <option value="Warehouse 1">Warehouse 1</option>
                  <option value="Warehouse 2">Warehouse 2</option>
                  <option value="Makati City">Makati City</option>
                  <option value="Quezon City">Quezon City</option>
                </select>
                <MediumButtons type="new" disabled={!id} />
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
                readOnly={!id}
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
                readOnly={!id}
              />
            </fieldset>
            <fieldset>
              <label htmlFor="warranty-expiration">Warranty Expiration Date</label>
              <input
                type="date"
                name="warrantyExpiration"
                max={currentDate}
                defaultValue={asset?.warrantyExpiration || ""}
                readOnly={!id}
              />
            </fieldset>
            <fieldset>
              <label htmlFor="end-of-life">End of Life</label>
              <input
                type="date"
                name="endOfLife"
                max={currentDate}
                defaultValue={asset?.endOfLife || ""}
                readOnly={!id}
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
                readOnly={!id}
              />
            </fieldset>
            <fieldset>
              <label htmlFor="purchase-date">Purchase Date</label>
              <input
                type="date"
                name="purchaseDate"
                max={currentDate}
                defaultValue={asset?.purchaseDate || ""}
                readOnly={!id}
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
                  readOnly={!id}
                />
              </div>
            </fieldset>
            <fieldset>
              <label htmlFor="notes">Notes</label>
              <textarea
                name="notes"
                maxLength="500"
                defaultValue={asset?.notes || ""}
                readOnly={!id}
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
                  disabled={!id}
                />
              </div>
              <label htmlFor="image" className="upload-image-btn">
                {!previewImage ? "Choose Image" : "Change Image"}
              </label>
            </fieldset>
          </form>
        </section>
      </main>
    </>
  );
}
