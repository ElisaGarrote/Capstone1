import "../../styles/custom-colors.css";
import "../../styles/CheckInOut.css";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import CloseIcon from "../../assets/icons/close.svg";
import { useForm } from "react-hook-form";

export default function CheckInAsset() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id, assetId, product, image, employee, checkOutDate, returnDate, condition } = location.state || {};
  const currentDate = new Date().toISOString().split("T")[0];
  
  // Dropdown lists for easier maintenance
  const conditionList = ['Excellent', 'Good', 'Fair', 'Poor'];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      checkoutTo: "employee",
      employee: '',
      location: '',
      checkoutDate: {currentDate},
      expectedReturnDate: '',
      condition: '',
      notes: '',
      image: []
    }
  });

  const [previewImages, setPreviewImages] = useState([]);

  const handleImagesSelection = (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length > 0) {
      const imagesArray = selectedFiles.map((file) => URL.createObjectURL(file));
      setPreviewImages(imagesArray);
      setValue("image", selectedFiles);
    } else {
      setPreviewImages([]);
      setValue("image", []);
    }
  };

  const onSubmit = (data) => {
    console.log("Form submitted:", data);
    navigate("/assets");
  };

  return (
    <>
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
              <label>Expected Return Date:</label>
              <p>{returnDate}</p>
            </fieldset>
            <fieldset>
              <label>Condition:</label>
              <p>{condition}</p>
            </fieldset>

            <h2>Asset Information</h2>
            <fieldset>
              <img src={image} alt="asset" />
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
                <label>Check-In Date *</label>
                <input
                  type="text"  // Use "text" instead of "date" to prevent date picker
                  readOnly
                  value={currentDate}  // Format: YYYY-MM-DD
                  className={errors.checkInDate ? 'input-error' : ''}
                  {...register("checkInDate")}
                />
              </fieldset>

              <fieldset>
                <label>Condition</label>
                <select {...register("condition")}>
                  <option value="">Select Condition</option>
                  {conditionList.map((condition, idx) => (
                    <option key={idx} value={condition}>{condition}</option>
                  ))}
                </select>
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
                    onChange={handleImagesSelection}
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