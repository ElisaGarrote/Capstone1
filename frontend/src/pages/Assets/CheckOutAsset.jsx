import "../../styles/custom-colors.css";
import "../../styles/CheckInOut.css";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import CloseIcon from "../../assets/icons/close.svg";
import PersonIcon from "../../assets/icons/person.svg";
import LocationIcon from "../../assets/icons/location.svg";
import { useForm } from "react-hook-form";

export default function CheckOutAsset() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id, assetId, product, image } = location.state || {};
  
  // Dropdown lists for easier maintenance
  const employeeList = ['Employee 1', 'Employee 2', 'Employee 3'];
  const locationList = ['Location 1', 'Location 2', 'Location 3'];
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
      checkoutDate: new Date().toISOString().split('T')[0],
      expectedReturnDate: '',
      condition: '',
      notes: '',
      photos: []
    }
  });

  const checkoutTo = watch("checkoutTo");
  const checkoutDate = watch("checkoutDate");
  const [previewImages, setPreviewImages] = useState([]);

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

  const onSubmit = (data) => {
    console.log("Form submitted:", data);
    console.log("Asset ID:", Id);
    navigate("/assets");
  };

  return (
    <>
      <nav><NavBar /></nav>
      <main className="checkin-accessory-page">
        <section className="top">
          <TopSecFormPage
            root="Assets"
            currentPage="Check-Out Asset"
            rootNavigatePage="/assets"
            title={assetId}
          />
        </section>
        <section className="middle">
          <section className="recent-checkout-info">
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
            <h2>Check-Out Form</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <fieldset>
                <label>Check-Out To *</label>
                <div className="checkout-to-container">
                  <section className="employee-radio-container">
                    <label>
                      <input
                        type="radio"
                        {...register("checkoutTo")}
                        value="employee"
                      />
                      <img src={PersonIcon} alt="person-icon" />
                      <span>Employee</span>
                    </label>
                  </section>
                  <section className="location-radio-container">
                    <label>
                      <input
                        type="radio"
                        {...register("checkoutTo")}
                        value="location"
                      />
                      <img src={LocationIcon} alt="location-icon" />
                      <span>Location</span>
                    </label>
                  </section>
                </div>
              </fieldset>

              {checkoutTo === "employee" ? (
                <fieldset>
                  <label>Employee *</label>
                  <select
                    className={errors.employee ? 'input-error' : ''}
                    {...register("employee", { required: 'Employee is required' })}
                  >
                    <option value="">Select Employee</option>
                    {employeeList.map((employee, idx) => (
                      <option key={idx} value={employee}>{employee}</option>
                    ))}
                  </select>
                  {errors.employee && <span className='error-message'>{errors.employee.message}</span>}
                </fieldset>
              ) : (
                <fieldset>
                  <label>Location *</label>
                  <select
                    className={errors.location ? 'input-error' : ''}
                    {...register("location", { required: 'Location is required' })}
                  >
                    <option value="">Select Location</option>
                    {locationList.map((location, idx) => (
                      <option key={idx} value={location}>{location}</option>
                    ))}
                  </select>
                  {errors.location && <span className='error-message'>{errors.location.message}</span>}
                </fieldset>
              )}
          
              <fieldset>
                <label>Check-Out Date *</label>
                <input
                  type="text"  // Use "text" instead of "date" to prevent date picker
                  readOnly
                  value={new Date().toLocaleDateString('en-CA')}  // Format: YYYY-MM-DD
                  className={errors.checkoutDate ? 'input-error' : ''}
                  {...register("checkoutDate")}
                />
              </fieldset>

              <fieldset>
                <label>Expected Return Date *</label>
                <input
                  type="date"
                  className={errors.expectedReturnDate ? 'input-error' : ''}
                  min={checkoutDate}
                  {...register("expectedReturnDate", { required: 'Expected return date is required' })}
                />
                {errors.expectedReturnDate && <span className='error-message'>{errors.expectedReturnDate.message}</span>}
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