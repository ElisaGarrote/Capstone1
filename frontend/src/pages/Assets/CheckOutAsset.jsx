import "../../styles/custom-colors.css";
import "../../styles/CheckInOut.css";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import CloseIcon from "../../assets/icons/close.svg";
import PersonIcon from "../../assets/icons/person.svg";
import LocationIcon from "../../assets/icons/location.svg";
import { useForm } from "react-hook-form";
import Alert from "../../components/Alert";
import assetsService from "../../services/assets-service";
import dtsService from "../../services/dts-integration-service";
import SystemLoading from "../../components/Loading/SystemLoading";

export default function CheckOutAsset() {
  const location = useLocation();
  const passedState = location.state;
  const currentDate = new Date().toISOString().split("T")[0];
  const conditionList = Array.from({ length: 10 }, (_, i) => (i + 1).toString());


  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (passedState) {
      console.log("Received state:", passedState);
    } else {
      console.warn("No state was passed!");
    }
  }, [passedState]);

  const {
    id,
    image,
    assetId,
    product,
    empId,
    employee,
    empLocation,
    checkoutDate,
    returnDate,
    ticketId,
    fromAsset,
  } = passedState || {};

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      employee: employee || "",
      empLocation: empLocation || "",
      checkoutDate: checkoutDate || "",
      expectedReturnDate: returnDate || "",
      condition: "",
      notes: "",
      photos: []
    },
  });

  useEffect(() => {
    if (passedState) {
      setValue("employee", passedState.employee || "");
      setValue("empLocation", passedState.empLocation || "");
      setValue("checkoutDate", passedState.checkoutDate || "");
      setValue("expectedReturnDate", passedState.returnDate || "");
    }
  }, [passedState, setValue]);


  const handleImagesSelection = (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length > 0) {
      const imagesArray = selectedFiles.map((file) => URL.createObjectURL(file));
      setPreviewImages(imagesArray);
      setValue("photos", selectedFiles);
    } else {
      setPreviewImages([]);
      setValue("photos", []);
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      formData.append('asset', id);
      formData.append('to_user_id', empId);
      formData.append('to_location', data.empLocation);
      formData.append('checkout_date', data.checkoutDate);
      formData.append('return_date', data.returnDate);

      const conditionValue = parseInt(data.condition, 10);
        if (!isNaN(conditionValue)) {
          formData.append('condition', conditionValue);
        }

      formData.append('notes', data.notes || '');
      formData.append('confirmation_notes', data.confirmationNotes || '');
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      for (let pair of formData.entries()) {
        console.log(pair[0]+ ': ' + pair[1]);
      }

      const checkout = await assetsService.createAssetCheckout(formData);
      const updateTckt = await dtsService.resolveCheckoutTicket(ticketId);

      if (fromAsset) {
        console.log("Ticket Information:", { ticketId });

        navigate('/assets', { 
          state: { 
            successMessage: "Asset has been checked out successfully!"
          } 
        });
      } else {
        navigate('/approved-tickets', {
          state: {
            successMessage: "Asset has been checked out successfully!"
          }
        });
      }

    } catch (error) {
      console.error("Error occured while checking out the asset:", error);
      setErrorMessage(
        error.message || "An error occurred while checking out the asset"
      );
    }
  };

  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      <nav><NavBar /></nav>
      <main className="check-in-out-page">
        <section className="top">
          <TopSecFormPage
            root={passedState?.fromAsset ? "Assets" : "Approved Tickets"}
            currentPage="Check-Out Asset"
            rootNavigatePage={passedState?.fromAsset ? "/assets" : "/approved-tickets"}
            title={assetId}
          />
        </section>
        <section className="middle">
          <section className="recent-checkout-info">
            <h2>Asset Information</h2>
            <fieldset>
              <img className="item-info-image" src={image} alt="asset" />
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
            <h2>Check-Out Form</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <fieldset>
                <label>Employee *</label>
                <input
                  type="text"
                  readOnly
                  {...register("employee")}
                />
              </fieldset>

              <fieldset>
                <label>Location *</label>
                <input
                  type="text"
                  readOnly
                  {...register("empLocation")}
                />
              </fieldset>

              <fieldset>
                <label>Check-Out Date *</label>
                <input
                  type="text"
                  readOnly
                  {...register("checkoutDate")}
                />
              </fieldset>

              <fieldset>
                <label>Expected Return Date *</label>
                <input
                  type="date"
                  className={errors.returnDate ? 'input-error' : ''}
                  {...register("returnDate", { required: "Expected return date is required" })}
                  defaultValue={passedState?.returnDate || ""}
                  {...(returnDate ? {} : { min: currentDate })}
                />
              </fieldset>

              <fieldset>
                <label>Condition *</label>
                <select 
                  {...register("condition", {required: "Condition is required"})}
                  className={errors.condition ? 'input-error' : ''}
                  >
                  <option value="">Select Condition</option>
                  {conditionList.map((condition, idx) => (
                    <option key={idx} value={condition}>{condition}</option>
                  ))}
                </select>
                {errors.condition && <span className='error-message'>{errors.condition.message}</span>}
              </fieldset>

              <fieldset>
                <label>Notes</label>
                <textarea {...register("notes")} maxLength="500" />
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
                          setValue("photos", previewImages.filter((_, i) => i !== index));
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
                    onChange={handleImagesSelection}
                    style={{ display: "none" }}
                  />
                </div>
                <label htmlFor="images" className="upload-image-btn">
                  {previewImages.length === 0 ? "Choose Image" : "Change Image"}
                </label>
              </fieldset>

              <button type="submit" className="save-btn">Save</button>
            </form>
          </section>
        </section>
      </main>
    </>
  );
}