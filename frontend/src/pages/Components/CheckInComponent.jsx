import "../../styles/custom-colors.css";
import "../../styles/CheckInOut.css";
import NavBar from "../../components/NavBar";
import TopSecFormPage from "../../components/TopSecFormPage";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import CloseIcon from "../../assets/icons/close.svg";
import { useForm } from "react-hook-form";

const sampleItems = [
  {
    id: 1,
    checkOutDate: '2023-10-01',
    user: 'John Doe',
    asset: 'Dell XPS 13',
    notes: 'For software development',
    checkInDate: '',
  },
  {
    id: 2,
    checkOutDate: '2023-10-02',
    user: 'Jane Smith',
    asset: 'Logitech Mouse',
    notes: 'For testing purposes',
    checkInDate: '',
  },
];

export default function CheckInComponent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id, name } = location.state || {};

  const onSubmit = (data) => {
    console.log("Form submitted:", data);
    navigate("/components");
  };

  return (
    <>
      <nav><NavBar /></nav>
      <main className="check-in-out-page">
        <section className="top">
          <TopSecFormPage
            root="Components"
            currentPage="Check-In Components"
            rootNavigatePage="/components"
            title={name}
          />
        </section>
        <section className="middle">
          <section className="recent-checkout-info">
            <h2>Check-out Info</h2>
            <fieldset>
              <label>Checked-Out To:</label>
              <p>{asset}</p>
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

            <h2>Asset Info</h2>
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
                  type="date"
                  className={errors.checkInDate ? 'input-error' : ''}
                  min={checkoutDate}
                  {...register("checkInDate", { required: 'Check-in date is required' })}
                />
                {errors.checkInDate && <span className='error-message'>{errors.checkInDate.message}</span>}
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