import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/NavBar";
import "../../styles/Registration.css";
import TopSecFormPage from "../../components/TopSecFormPage";

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
    formState: { errors, isValid }
  } = useForm({
    mode: "all",
    defaultValues: {
      checkinDate: checkinDate || currentDate,
      condition: '',
      notes: ''
    }
  });



  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("asset_checkout", checkoutId);
      formData.append("checkin_date", data.checkinDate);
      formData.append("condition", data.condition);
      formData.append("notes", data.notes || "");

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
      <main className="registration">
        <section className="top">
          <TopSecFormPage
            root="Assets"
            currentPage="Check-In Asset"
            rootNavigatePage="/assets"
            title={assetId}
          />
        </section>
        <section className="registration-form">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Checkin Date */}
            <fieldset>
              <label htmlFor="checkinDate">Checkin Date <span style={{color: 'red'}}>*</span></label>
              <input
                type="date"
                id="checkinDate"
                className={errors.checkinDate ? 'input-error' : ''}
                {...register("checkinDate", { required: "Checkin date is required" })}
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

            {/* Submit */}
            <button type="submit" className="primary-button" disabled={!isValid}>
              Save
            </button>
          </form>
        </section>
      </main>
    </>
  );
}