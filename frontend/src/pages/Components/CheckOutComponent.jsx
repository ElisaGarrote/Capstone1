import "../../styles/custom-colors.css";
import "../../styles/CheckInOut.css";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import DefaultImage from "../../assets/img/default-image.jpg";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import assetsService from "../../services/assets-service";  // make sure this has fetchAssetNames

export default function CheckOutComponent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeId } = useParams();

  // From navigate state
  const { image, name, category, available } = location.state || {};

  const currentDate = new Date().toISOString().split("T")[0];

  // ASSET DROPDOWN STATE
  const [assetList, setAssetList] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [assetError, setAssetError] = useState("");

  useEffect(() => {
    const loadAssets = async () => {
      try {
        setLoadingAssets(true);
        const assets = await assetsService.fetchAssetNames();
        if (assets) {
          setAssetList(assets);
        } else {
          setAssetError("Failed to load asset list.");
        }
      } catch (error) {
        console.error("Error loading assets:", error);
        setAssetError("An error occurred loading assets.");
      } finally {
        setLoadingAssets(false);
      }
    };

    loadAssets();
  }, []);

  // Form handling
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      componentId: routeId,
      asset: '',
      quantity: '',
      checkOutDate: currentDate,
      notes: '',
    }
  });

  const onSubmit = async (data) => {
    try {
      console.log("Submitting checkout data:", data);
      const formData = new FormData();

      formData.append("component", routeId);
      formData.append("to_asset", data.asset);
      formData.append("quantity", data.quantity);
      formData.append("notes", data.notes || "");

      await assetsService.createComponentCheckout(formData);

      navigate("/components", {
        state: { successMessage: `Component "${name}" checked out successfully!` },
      });
    } catch (error) {
      console.error("Error submitting checkout:", error);
      alert(
        error?.detail || error?.message || "Failed to submit checkout. Please try again."
      );
    }
  };

  return (
    <>
      <nav>
        <NavBar />
      </nav>
      <main className="check-in-out-page">
        <section className="top">
          <TopSecFormPage
            root="Components"
            currentPage="Check-Out Component"
            rootNavigatePage="/components"
            title={name || "Check-Out"}
          />
        </section>

        <section className="middle">
          <section className="recent-checkout-info">
            <h2>Component Information</h2>
            <fieldset>
              <img
                src={image || DefaultImage}
                alt={name || "Component Image"}
                className="item-info-image"
              />
            </fieldset>
            <fieldset>
              <label>Name:</label>
              <p>{name || "N/A"}</p>
            </fieldset>
            <fieldset>
              <label>Category:</label>
              <p>{category || "N/A"}</p>
            </fieldset>
          </section>

          <section className="checkin-form">
            <h2>Check-Out Form</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              
              <fieldset>
                <label>Check-Out To *</label>
                {loadingAssets ? (
                  <input
                    type="text"
                    value="Loading assets..."
                    readOnly
                    className="readonly-loading-input"
                  />
                ) : (
                  <select
                    className={errors.asset ? 'input-error' : ''}
                    {...register("asset", { required: 'Asset is required' })}
                  >
                    {assetError || assetList.length === 0 ? (
                      <option value="" disabled>No assets available</option>
                    ) : (
                      <>
                        <option value="">Select an Asset</option>
                        {assetList.map((asset) => (
                          <option key={asset.id} value={asset.id}>
                            {asset.displayed_id} - {asset.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                )}
                {errors.asset && <span className="error-message">{errors.asset.message}</span>}
              </fieldset>

              <fieldset>
                <label htmlFor="component-quantity">Quantity *</label>
                <input
                  type="number"
                  className={errors.quantity ? 'input-error' : ''}
                  {...register("quantity", {
                    required: 'Quantity is required',
                    min: { value: 1, message: 'Quantity must be at least 1' },
                    ...(available && {
                      max: {
                        value: available,
                        message: `Cannot exceed available quantity (${available})`
                      }
                    })
                  })}
                  placeholder={available ? `Up to ${available}` : 'Enter quantity'}
                  max={available}
                  min={1}
                />
                {errors.quantity && <span className="error-message">{errors.quantity.message}</span>}
              </fieldset>

              <fieldset>
                <label>Check-Out Date *</label>
                <input
                  type="text"
                  readOnly
                  value={currentDate}
                  {...register("checkOutDate")}
                />
              </fieldset>

              <fieldset>
                <label>Notes</label>
                <textarea
                  {...register("notes")}
                  maxLength="500"
                  placeholder="Additional notes..."
                />
              </fieldset>

              <button type="submit" className="save-btn">Save</button>
            </form>
          </section>
        </section>
      </main>
    </>
  );
}
