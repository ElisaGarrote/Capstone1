import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import "../../styles/Registration.css";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useForm } from "react-hook-form";
import Alert from "../../components/Alert";
import { createAssetCheckin } from "../../services/assets-service";
import { resolveTicket } from "../../services/contexts-service";
import dtsService from "../../services/dts-integration-service";
import CloseIcon from "../../assets/icons/close.svg";


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

  const [errorMessage, setErrorMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);


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
    fromAsset,
    fromTicket
  } = location.state || {};

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid }
  } = useForm({
    mode: "all",
    defaultValues: {
      checkinDate: checkinDate || currentDate,
      status: '',
      condition: '',
      location: '',
      notes: ''
    }
  });



  // Handle file selection
  const handleFileSelection = (e) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validFiles = [];

    files.forEach(file => {
      if (file.size > maxSize) {
        setErrorMessage(`${file.name} exceeds 5MB and was not added.`);
        setTimeout(() => setErrorMessage(""), 5000);
      } else if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setErrorMessage(`${file.name} is not a valid image format. Only .jpeg and .png are allowed.`);
        setTimeout(() => setErrorMessage(""), 5000);
      } else {
        validFiles.push(file);
      }
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  // Remove file from selection
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };



  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      // Required fields
      formData.append("asset_checkout", checkoutId);
      formData.append("checkin_date", data.checkinDate);
      formData.append("condition", data.condition);

      // Optional fields
      formData.append("ticket_id", ticketId);
      formData.append("notes", data.notes || "");

      // Append image files
      selectedFiles.forEach((file, index) => {
        formData.append(`image_${index}`, file);
      });

      await createAssetCheckin(formData);
      await resolveTicket(ticketId);

      // Navigate to asset view page after successful check-in
      navigate(`/assets/view/${id}`, {
        state: { successMessage: "Asset has been checked in successfully!" }
      });
    } catch (error) {
      console.error("Error checking in asset:", error);
      setErrorMessage("An error occurred while checking in the asset.");
    }
  };



  return (
    <>
      {errorMessage && <Alert message={errorMessage} type="danger" />}
      <nav><NavBar /></nav>
      <main className="registration">
        <section className="top">
          <TopSecFormPage
            root={fromAsset ? "Assets" : "Tickets"}
            currentPage="Check-In Asset"
            rootNavigatePage={fromAsset ? "/assets" : "/tickets"}
            title={assetId}
          />
        </section>
        <section className="registration-form">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Form Header */}
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: 'var(--secondary-text-color)',
              marginBottom: '10px',
              borderBottom: '1px solid #d3d3d3',
              paddingBottom: '10px'
            }}>
              Check-In Details
            </h2>

            {/* Check-In Date */}
            <fieldset>
              <label htmlFor="checkinDate">Check-In Date <span style={{color: 'red'}}>*</span></label>
              <input
                type="date"
                id="checkinDate"
                className={errors.checkinDate ? 'input-error' : ''}
                {...register("checkinDate", { required: "Check-in date is required" })}
                defaultValue={checkinDate || currentDate}
              />
              {errors.checkinDate && (
                <span className="error-message">{errors.checkinDate.message}</span>
              )}
            </fieldset>

            {/* Condition */}
            <fieldset>
              <label htmlFor="condition">Condition <span style={{color: 'red'}}>*</span></label>
              <select
                id="condition"
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

            {/* Notes */}
            <fieldset>
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                placeholder="Enter notes"
                {...register("notes")}
                rows="3"
                maxLength="500"
              ></textarea>
            </fieldset>

            {/* Image Upload */}
            <fieldset>
              <label>Image Upload</label>
              <div className="attachments-wrapper">
                {/* Left column: Upload button & info */}
                <div className="upload-left">
                  <label htmlFor="images" className="upload-image-btn">
                    Choose File
                    <input
                      type="file"
                      id="images"
                      accept=".jpeg,.jpg,.png"
                      onChange={handleFileSelection}
                      style={{ display: "none" }}
                      multiple
                    />
                  </label>
                  <small className="file-size-info">
                    Maximum file size must be 5MB
                  </small>
                </div>

                {/* Right column: Uploaded files */}
                <div className="upload-right">
                  {selectedFiles.map((file, index) => (
                    <div className="file-uploaded" key={index}>
                      <span title={file.name}>{file.name}</span>
                      <button type="button" onClick={() => removeFile(index)}>
                        <img src={CloseIcon} alt="Remove" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </fieldset>

            {/* Submit */}
            <button type="submit" className="primary-button" disabled={!isValid}>
              Save
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}