import "../../styles/custom-colors.css";
import "../../styles/Registration.css";
import "../../styles/CheckInOut.css";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import CloseIcon from "../../assets/icons/close.svg";
import { useForm } from "react-hook-form";
import Alert from "../../components/Alert";
import assetsService from "../../services/assets-service";
import dtsService from "../../services/dts-integration-service";
import SystemLoading from "../../components/Loading/SystemLoading";
import DefaultImage from "../../assets/img/default-image.jpg";


export default function CheckInAsset() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentDate = new Date().toISOString().split("T")[0];
  const conditionOptions = [
    { value: "1", label: "1 - Unserviceable" },
    { value: "2", label: "2 - Poor" },
    { value: "3", label: "3 - Needs Maintenance" },
    { value: "4", label: "4 - Functional" },
    { value: "5", label: "5 - Fair" },
    { value: "6", label: "6 - Good" },
    { value: "7", label: "7 - Very Good" },
    { value: "8", label: "8 - Excellent" },
    { value: "9", label: "9 - Like New" },
    { value: "10", label: "10 - Brand New" }
  ];

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);


  const {
    id,
    assetId,
    product,
    image,
    employee,
    empLocation,
    checkOutDate,
    returnDate,
    condition,
    checkoutId,
    checkinDate,
    ticketId,
    fromAsset
  } = location.state || {};

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      checkinDate: checkinDate || currentDate,
      condition: '',
      notes: ''
    }
  });

  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
  const initialize = async () => {
    setIsLoading(true);
    try {
      setValue("condition", "");
      setValue("notes", "");
      setValue("image", []);
    } catch (error) {
      console.error("Error initializing Check-In form:", error);
      setErrorMessage("Failed to initialize data.");
    } finally {
      setIsLoading(false);
    }
  };

  initialize();
}, [setValue]);

  const handleImageSelection = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file); // store the actual file
      setValue('image', file); // optional: sync with react-hook-form
  
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result); // for display only
      };
      reader.readAsDataURL(file);
    }
  }; 

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("asset_checkout", checkoutId);
      formData.append("checkin_date", checkinDate);
      formData.append("condition", data.condition);
      formData.append("notes", data.notes || "");
      
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      await assetsService.createAssetCheckin(formData);
      await dtsService.resolveCheckoutTicket(ticketId);

      navigate("/assets", {
        state: { successMessage: "Asset has been checked in successfully!" }
      });
    } catch (error) {
      console.error("Error checking in asset:", error);
      setErrorMessage("An error occurred while checking in the asset.");
    }
  };

  if (isLoading) {
    console.log("isLoading triggered — showing loading screen");
    return <SystemLoading />;
  }

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      <nav><NavBar /></nav>
      <main className="check-in-out-page">
        <section className="top">
          <TopSecFormPage
            root="Assets"
            currentPage="Check-In Asset"
            rootNavigatePage="/assets"
            title={assetId}
          />
        </section>
        <section className="middle">
          <section className="recent-checkout-info">
            <h2>Check-Out Information</h2>
            <fieldset>
              <label>Checked-Out To:</label>
              <p>{employee}</p>
            </fieldset>
            <fieldset>
              <label>Check-Out Date:</label>
              <p>{checkOutDate}</p>
            </fieldset>
            <fieldset>
              <label>Condition:</label>
              <p>{condition}</p>
            </fieldset>

            <h2>Asset Information</h2>
            <fieldset>
              <img
                className="item-info-image"
                src={image} alt="asset"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = DefaultImage;
                }}
              />
            </fieldset>
            <fieldset>
              <label>Asset ID:</label>
              <p>{assetId}</p>
            </fieldset>
            <fieldset>
              <label>Product:</label>
              <p>{product}</p>
            </fieldset>
          </section>

          <section className="checkin-form">
            <h2>Check-In Form</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <fieldset>
                <label>Checkin Date <span style={{color: 'red'}}>*</span></label>
                <input
                  type="date"
                  className={errors.checkinDate ? 'input-error' : ''}
                  {...register("checkinDate", { required: "Checkin date is required" })}
                  defaultValue={checkinDate || ""}
                  {...(checkinDate ? {} : { min: currentDate })}
                />
              </fieldset>

              <fieldset>
                <label>Condition <span style={{color: 'red'}}>*</span></label>
                <select 
                  {...register("condition", {required: "Condition is required"})}
                  className={errors.condition ? 'input-error' : ''}
                  >
                  <option value="">Select Condition</option>
                  {conditionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.condition && <span className='error-message'>{errors.condition.message}</span>}
              </fieldset>

              <fieldset>
                <label>Image</label>
                <div className="images-container">
                  {previewImages.map((img, index) => (
                    <div key={index} className="image-selected">
                      <img src={img} alt={`Preview ${index}`} />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImages(previewImages.filter((_, i) => i !== index));
                          setValue("image", previewImages.filter((_, i) => i !== index));
                        }}
                      >
                        <img src={CloseIcon} alt="Remove" />
                      </button>
                    </div>
                  ))}
                  <input
                    type="file"
                    id="images"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelection}
                    style={{ display: "none" }}
                  />
                </div>
                <label htmlFor="images" className="upload-image-btn">
                  {previewImages.length === 0 ? "Choose Image" : "Change Image"}
                </label>
              </fieldset>

              <fieldset>
                <label>Notes</label>
                <textarea {...register("notes")} maxLength="500" />
              </fieldset>

              <button type="submit" className="save-btn">Save</button>
            </form>
          </section>
        </section>
      </main>
    </>
  );
}